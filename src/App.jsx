import React, { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import UserSelector from "./components/UserSelector.jsx";
import ItemList from "./components/ItemList.jsx";
import ItemDetail from "./components/ItemDetail.jsx";
import Recommendations from "./components/Recommendations.jsx";
import ShopsList from "./components/ShopsList.jsx";
import {
  fetchHealth,
  fetchItems,
  fetchRecommendations,
  changeItemPrice,
  fetchCurrentUser,
  fetchShops,
  purchaseItem
} from "./api.js";

export default function App() {
  const [health, setHealth] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(0); // 0 = invité
  const [currentUser, setCurrentUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [recoData, setRecoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // charge health + user + items + shops au changement d'utilisateur
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      setRecoData(null);
      setShops([]);
      try {
        const healthRes = await fetchHealth();
        setHealth(healthRes);

        const userRes = await fetchCurrentUser(selectedUserId);
        setCurrentUser(userRes);

        const isSeller = userRes && userRes.roles.includes("seller");
        const isBuyerOnly =
          userRes &&
          userRes.roles.includes("buyer") &&
          !userRes.roles.includes("seller");

        // Seller → peut filtrer sur ses annonces (scope=mine) si on veut,
        // mais on veut que seller voie tout le catalogue EN PLUS de ses shops,
        // donc ici on ne met pas de scope et on laisse voir tout.
        const scope = isSeller && !isBuyerOnly ? undefined : undefined;

        const itemsRes = await fetchItems(selectedUserId, { scope });
        setItems(itemsRes);
        setSelectedItem(itemsRes[0] || null);

        // Shops uniquement pour les sellers
        if (isSeller) {
          const shopsRes = await fetchShops(selectedUserId);
          setShops(shopsRes);
        }
      } catch (e) {
        console.error(e);
        // si selectedUserId = 0 (invité), fetchCurrentUser renvoie null et ça va,
        // l'erreur vient sans doute d'ailleurs
        setError("Impossible de charger les données (API ou utilisateur).");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [selectedUserId]);

  const handleLoadRecommendations = async () => {
    if (!currentUser || !currentUser.roles.includes("buyer")) return;
    setLoadingRecs(true);
    setError(null);
    try {
      const data = await fetchRecommendations(selectedUserId);
      setRecoData(data);
    } catch (e) {
      console.error(e);
      setError("Erreur lors du chargement des recommandations (buyer seulement).");
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleChangePrice = async (itemId, newPrice) => {
    try {
      const res = await changeItemPrice(selectedUserId, itemId, newPrice);
      setToast(
        `Prix mis à jour : ${res.event.oldPrice} → ${res.event.newPrice} (suspect: ${
          res.event.fraudCheck.suspicious ? "oui" : "non"
        })`
      );

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
        "Erreur lors du changement de prix (seller & propriétaire de l’article requis)."
      );
    }
  };

  const handlePurchase = async (itemId) => {
    try {
      const res = await purchaseItem(selectedUserId, itemId);
      setToast(
        `Achat simulé : commande ${res.order.orderId} pour ${res.order.amount} ${res.order.currency}`
      );
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      console.error(e);
      setError(
        "Erreur lors de l'achat (il faut être identifié avec le rôle buyer)."
      );
    }
  };

  const sidebar = (
    <>
      <UserSelector
        selectedUserId={selectedUserId}
        onChangeUser={setSelectedUserId}
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
      {currentUser && currentUser.roles.includes("seller") && (
        <ShopsList shops={shops} />
      )}
    </>
  );

  if (loading) {
    return <div className="loading-screen">Chargement de l’interface…</div>;
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
            {currentUser?.roles.includes("buyer") && (
              <Recommendations data={recoData} />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
