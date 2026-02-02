import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE, fetchConversation, sendMessage } from "../api";

type WsStatus = "disconnected" | "connecting" | "connected" | "error";

export default function ChatPanel({
  accessToken,
  currentUser,
  isAuthenticated,
  selectedItem,
}: ChatPanelProps): JSX.Element {
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<WsStatus>("disconnected");

  const wsRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(() => {
    if (!accessToken) return null;

    const base =
      import.meta.env.VITE_WS_BASE ||
      (API_BASE
        ? API_BASE.replace(/^http/, "ws")
        : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`);

    return `${base.replace(/\/$/, "")}/ws?token=${encodeURIComponent(accessToken)}`;
  }, [accessToken]);

  // Auto-select conversation based on selected item
  useEffect(() => {
    if (!selectedItem || !currentUser?.id) {
      setActiveUserId("");
      return;
    }

    const isOwner = selectedItem.sellerId === currentUser.id;

    if (!isOwner) {
      // Acheteur : sélectionne le vendeur automatiquement
      if (selectedItem.sellerId !== currentUser.id) {
        setActiveUserId(selectedItem.sellerId);
      }
    } else {
      // Propriétaire : ne sélectionne personne (il choisit parmi les watchers)
      setActiveUserId("");
    }
  }, [selectedItem, currentUser]);

  useEffect(() => {
    if (!accessToken || !activeUserId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchConversation(activeUserId, accessToken);
        if (!cancelled) setMessages(res.messages || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("Impossible de charger l'historique.");
          setMessages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, activeUserId]);

  useEffect(() => {
    if (!wsUrl || !activeUserId) return;

    setWsStatus("connecting");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
      ws.send(JSON.stringify({ type: "hello" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "message") {
          const isRelevant =
            msg.fromUserId === activeUserId || msg.toUserId === activeUserId;

          if (!isRelevant) return;

          setMessages((prev) => {
            if (prev.some((m) => m.serverMsgId === msg.serverMsgId)) return prev;
            return [...prev, msg];
          });
        }
      } catch (e) {
        console.warn("Invalid WS payload", e);
      }
    };

    ws.onerror = () => setWsStatus("error");
    ws.onclose = () => setWsStatus("disconnected");

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [wsUrl, activeUserId]);

  const openConversation = (userId: string): void => {
    if (!userId.trim()) return;
    if (userId.trim() === currentUser?.id) {
      setError("Impossible de discuter avec vous-même.");
      return;
    }
    setError(null);
    setActiveUserId(userId.trim());
  };

  const handleSend = async (): Promise<void> => {
    if (!accessToken || !activeUserId) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    setContent("");

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "send_message",
          toUserId: activeUserId,
          content: trimmed,
        })
      );
      return;
    }

    try {
      const msg = await sendMessage(activeUserId, trimmed, accessToken);
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      console.error(e);
      setError("Échec de l'envoi du message.");
    }
  };

  const formatTime = (iso: string): string => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const canChat = Boolean(accessToken && currentUser?.id);
  const isOwner = selectedItem && currentUser && selectedItem.sellerId === currentUser.id;
  const watchers = selectedItem?.watchers || [];
  const availableWatchers = watchers.filter((w) => w !== currentUser?.id);

  return (
    <div className="card chat-panel">
      <div className="card-title-row">
        <h2 className="card-title">Chat 1v1</h2>
        <span className="chat-status">
          <span
            className={`status-dot ${
              wsStatus === "connected" ? "status-ok" : ""
            }`}
          />
          {wsStatus}
        </span>
      </div>

      {!isAuthenticated && (
        <p className="hint">Connectez-vous pour activer le chat.</p>
      )}

      {isAuthenticated && !currentUser && (
        <p className="hint">Profil non disponible.</p>
      )}

      {canChat && !selectedItem && (
        <p className="hint">Sélectionnez un article pour démarrer une conversation.</p>
      )}

      {canChat && selectedItem && (
        <>
          {isOwner ? (
            <div className="field">
              <label>Acheteurs potentiels (watchers)</label>
              {availableWatchers.length === 0 ? (
                <p className="hint">Aucun acheteur intéressé pour le moment.</p>
              ) : (
                <div className="chat-user-list">
                  {availableWatchers.map((watcherId) => (
                    <button
                      key={watcherId}
                      className={`chat-user-btn ${
                        activeUserId === watcherId ? "is-active" : ""
                      }`}
                      onClick={() => openConversation(watcherId)}
                    >
                      <div>
                        <strong>{watcherId}</strong>
                        <div className="hint">Acheteur potentiel</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="field">
              <label>Conversation avec le vendeur</label>
              <div className="chat-user-list">
                <button className="chat-user-btn is-active" style={{ cursor: "default" }}>
                  <div>
                    <strong>{selectedItem.sellerId}</strong>
                    <div className="hint">Vendeur de cet article</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {activeUserId && (
            <>
              <div className="chat-messages">
                {loading && <p className="hint">Chargement…</p>}
                {!loading && messages.length === 0 && (
                  <p className="hint">Aucun message pour l'instant.</p>
                )}

                {messages.map((msg) => {
                  const isMe = msg.fromUserId === currentUser?.id;
                  return (
                    <div
                      key={msg.serverMsgId}
                      className={`chat-message ${isMe ? "chat-message--me" : ""}`}
                    >
                      <div>{msg.content}</div>
                      <div className="chat-meta">
                        <span>{isMe ? "Moi" : msg.fromUserId}</span>
                        <span>{formatTime(msg.sentAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-input-row">
                <input
                  className="chat-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrire un message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSend();
                  }}
                />
                <button className="btn-primary" onClick={handleSend}>
                  Envoyer
                </button>
              </div>
            </>
          )}

          {isOwner && !activeUserId && availableWatchers.length > 0 && (
            <p className="hint">Sélectionnez un acheteur pour commencer la conversation.</p>
          )}
        </>
      )}
    </div>
  );
}