import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api";

function PaymentCardsScreen() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get("/api/payments/cards");
        setCards(res.data.cards || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load cards");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleAddCard = async () => {
    try {
      const res = await api.post("/api/payments/cards", {});
      // Expect backend to return an authorization URL from Paystack
      const authUrl = res.data?.authorizationUrl;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        alert("No authorization URL returned");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not start card addition";
      alert(msg);
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: 90, paddingBottom: 60 }}>
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
            <div>
              <h1 style={{ margin: 0 }}>Payment Cards</h1>
              <p style={{ margin: "6px 0 0", color: "#555" }}>
                Cards are processed via Paystack. Add a card to enable payments and payouts.
              </p>
            </div>
            <button className="profile-option-btn" onClick={handleAddCard}>Add new card</button>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            {loading ? (
              <div>Loading cards...</div>
            ) : error ? (
              <div style={{ color: "#b91c1c" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div>No cards on file yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {cards.map((card) => (
                  <div
                    key={card.id || card.authorization_code}
                    style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, display: "grid", gap: 4 }}
                  >
                    <div><strong>Brand:</strong> {card.brand || card.card_type || "Card"}</div>
                    <div><strong>Last4:</strong> {card.last4 || card.last_digits || "****"}</div>
                    <div><strong>Exp:</strong> {card.exp_month && card.exp_year ? `${card.exp_month}/${card.exp_year}` : card.expiry}</div>
                    <div><strong>Status:</strong> {card.reusable === false ? "Single-use" : "Reusable"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => navigate("/moneybox")}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary-color)",
                textDecoration: "underline",
                textDecorationColor: "var(--secondary-color)",
                cursor: "pointer",
                padding: 0,
                fontSize: 14,
                fontWeight: 600,
              }}
              aria-label="Back to Money Box"
            >
              ← Back to Money Box
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default PaymentCardsScreen;
