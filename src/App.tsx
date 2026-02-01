import { useEffect, useState, ReactNode } from "react";

import Layout from "./components/Layout";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import UserSelector from "./components/UserSelector";
import ShopsList from "./components/ShopsList";
import Recommendations from "./components/Recommendations";

import {
  fetchHealth,
  fetchItems,
  fetchRecommendations,
  fetchCurrentUser,
  purchaseItem,
  changeItemPrice,
  fetchShops,
} from "./api";

export default function App(): JSX.Element {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [recoData, setRecoData] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // charge health + user + items + shops au changement d'accessToken
  useEffect(() => {
    async function init(): Promise<void> {
      setLoading(true);
      setError(null);
      setRecoData(null);
      setShops([]);
      try {
        const healthRes = await fetchHealth();
        setHealth(healthRes);

        let userRes: CurrentUser | null = null;
        if (accessToken) {
          try {
            userRes = await fetchCurrentUser(accessToken);
            setCurrentUser(userRes);
          } catch (e) {
            console.warn("Failed to fetch current user", e);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }

        const isSeller = userRes?.roles?.includes("seller");

        const itemsRes = await fetchItems({ scope: undefined });
        setItems(itemsRes);
        setSelectedItem(itemsRes[0] || null);

        // Shops uniquement pour les sellers
        if (isSeller && accessToken) {
          const shopsRes = await fetchShops(accessToken);
          setShops(shopsRes);
        }
      } catch (e) {
        console.error(e);
        setError("Impossible de charger les données (API ou utilisateur).");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [accessToken]);

  const handleLoadRecommendations = async (): Promise<void> => {
    if (!currentUser?.id || !currentUser?.roles?.includes("buyer")) return;
    setLoadingRecs(true);
    setError(null);
    try {
      const userId = parseInt(currentUser.id, 10);
      const data = await fetchRecommendations(userId, accessToken);
      setRecoData(data);
    } catch (e) {
      console.error(e);
      setError(
        "Erreur lors du chargement des recommandations (buyer seulement)."
      );
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleChangePrice = async (
    itemId: number | string,
    newPrice: number
  ): Promise<void> => {
    try {
      await changeItemPrice(itemId, newPrice, accessToken);
      setToast(`Prix mis à jour à ${newPrice}`);

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, price: newPrice } : it
        )
      );
      setSelectedItem((prev) =>
        prev && prev.id === itemId ? { ...prev, price: newPrice } : prev
      );

      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      console.error(e);
      setError(
        "Erreur lors du changement de prix (seller & propriétaire de l'article requis)."
      );
    }
  };

  const handlePurchase = async (itemId: number | string): Promise<void> => {
    try {
      await purchaseItem(itemId, accessToken);
      setToast(`Achat simulé pour l'article ${itemId}`);
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      console.error(e);
      setError(
        "Erreur lors de l'achat (il faut être identifié avec le rôle buyer)."
      );
    }
  };

  const sidebar: ReactNode = (
    <>
      <UserSelector
        accessToken={accessToken}
        onChangeAccessToken={setAccessToken}
        onLoadRecommendations={handleLoadRecommendations}
        loadingRecs={loadingRecs}
        currentUser={currentUser}
      />
      {health && (
        <div className="card">
          <h2 className="card-title">Statut API</h2>
          <p>
            <span className="status-dot status-ok" /> {health.status} –{" "}
            {health.service}
          </p>
          <p className="hint">version {health.version}</p>
        </div>
      )}
      {currentUser?.roles?.includes("seller") && (
        <ShopsList shops={shops} />
      )}
    </>
  );

  if (loading) {
    return <div className="loading-screen">Chargement de l'interface…</div>;
  }

  return (
    <>
      <Layout sidebar={sidebar}>
        {error && <div className="alert alert-error">{error}</div>}
        {toast && <div className="alert alert-info">{toast}</div>}

        <div className="main-grid">
          <div className="main-column">
            <ItemList
              items={items}
              onSelect={setSelectedItem}
              currentUser={currentUser}
            />
          </div>
          <div className="main-column">
            <ItemDetail
              item={selectedItem}
              onChangePrice={handleChangePrice}
              onPurchase={handlePurchase}
              currentUser={currentUser}
            />
            {currentUser?.roles?.includes("buyer") && (
              <Recommendations data={recoData} />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}