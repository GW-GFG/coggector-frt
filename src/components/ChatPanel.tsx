import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE, fetchConversation, fetchOnlineUsers, sendMessage } from "../api";

const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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
  const [isActiveUserOnline, setIsActiveUserOnline] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

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

    const actualSellerId = selectedItem.seller?.id || selectedItem.sellerId;
    const isOwner = actualSellerId === currentUser.id;

    if (!isOwner) {
      // If I'm not the owner, chat with the seller
      if (actualSellerId !== currentUser.id) {
        setActiveUserId(actualSellerId);
      }
    } else {
      // If I'm the owner, reset active user (let me choose among watchers)
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

  // Poll online status for active user
  useEffect(() => {
    if (!accessToken || !activeUserId) {
      setIsActiveUserOnline(false);
      return;
    }

    const checkOnlineStatus = async () => {
      try {
        const result = await fetchOnlineUsers(accessToken);
        setIsActiveUserOnline(result.onlineUserIds.includes(activeUserId));
      } catch (e) {
        console.error("Failed to fetch online users", e);
      }
    };

    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [accessToken, activeUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!wsUrl || !activeUserId) {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      reconnectAttemptsRef.current = 0;
      return;
    }

    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        ws.send(JSON.stringify({ type: "hello" }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "message") {
            const isRelevant =
              msg.fromUserId === activeUserId || msg.toUserId === activeUserId;

            if (!isRelevant) return;

            const chatMsg: ChatMessage = {
              serverMsgId: msg.serverMsgId!,
              conversationId: msg.conversationId!,
              fromUserId: msg.fromUserId!,
              fromUsername: msg.fromUsername,
              toUserId: msg.toUserId!,
              content: msg.content!,
              sentAt: msg.sentAt!,
            };

            setMessages((prev) => {
              if (prev.some((m) => m.serverMsgId === chatMsg.serverMsgId)) return prev;
              return [...prev, chatMsg];
            });
          }
        } catch (e) {
          console.warn("Invalid WS payload", e);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        
        // Reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsUrl && activeUserId) {
            connectWebSocket();
          }
        }, delay);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [wsUrl, activeUserId]);

  const openConversation = (userId: string): void => {
    const trimmedId = userId.trim();
    if (!trimmedId) return;
    if (trimmedId === currentUser?.id) {
      setError("Impossible de discuter avec vous-même.");
      return;
    }
    setError(null);
    setActiveUserId(trimmedId);
  };

  const handleSend = async (): Promise<void> => {
    if (!accessToken || !activeUserId || !currentUser?.id) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    setContent("");

    // If WebSocket is open, send directly (server will broadcast back)
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

    // Fallback to REST with optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      serverMsgId: tempId,
      conversationId: "",
      fromUserId: currentUser.id,
      fromUsername: currentUser.username,
      toUserId: activeUserId,
      content: trimmed,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const msg = await sendMessage(activeUserId, trimmed, accessToken);
      // Replace optimistic message with real one
      setMessages((prev) => 
        prev.map(m => m.serverMsgId === tempId ? msg : m)
      );
    } catch (e) {
      console.error(e);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.serverMsgId !== tempId));
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
  const actualSellerId = selectedItem?.seller?.id || selectedItem?.sellerId;
  const isOwner = selectedItem && currentUser && actualSellerId === currentUser.id;
  const watchers = selectedItem?.watchers || [];
  const availableWatchers = watchers.filter((w) => w.id !== currentUser?.id);

  return (
    <div className="card chat-panel">
      <div className="card-title-row">
        <h2 className="card-title">Chat 1v1</h2>
        {activeUserId && (
          <span className="chat-status">
            <span
              className={`status-dot ${
                isActiveUserOnline ? "status-ok" : ""
              }`}
            />
            {isActiveUserOnline ? "En ligne" : "Hors ligne"}
          </span>
        )}
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
                  {availableWatchers.map((watcher) => (
                    <button
                      key={watcher.id}
                      className={`chat-user-btn ${
                        activeUserId === watcher.id ? "is-active" : ""
                      }`}
                      onClick={() => openConversation(watcher.id)}
                    >
                      <div>
                        <strong>{capitalize(watcher.username || watcher.id)}</strong>
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
                    <strong>{capitalize(selectedItem.seller?.username || selectedItem.sellerId)}</strong>
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
                  const rawName = isMe 
                    ? (currentUser?.username || "Moi")
                    : (msg.fromUsername || msg.fromUserId);
                  const displayName = rawName === "Moi" ? rawName : capitalize(rawName);

                  return (
                    <div
                      key={msg.serverMsgId}
                      className={`chat-message ${isMe ? "chat-message--me" : ""}`}
                    >
                      <div>{msg.content}</div>
                      <div className="chat-meta">
                        <span>{displayName}</span>
                        <span>{formatTime(msg.sentAt)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
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