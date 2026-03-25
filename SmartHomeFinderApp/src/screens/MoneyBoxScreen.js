import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { provisionVirtualAccount, fetchMyTransactions } from "../api/paymentService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";

function MoneyBoxScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState("");
  const [virtualAccount, setVirtualAccount] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    const fetchVA = async () => {
      try {
        setVaError("");
        setVaLoading(true);
        const info = await provisionVirtualAccount();
        setVirtualAccount(info);
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Could not load account";
        setVaError(msg);
      } finally {
        setVaLoading(false);
      }
    };
    fetchVA();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return;
      try {
        setHistoryError("");
        setHistoryLoading(true);
        const txs = await fetchMyTransactions();
        const mapped = txs
          .map((tx) => {
            const isBuyer = tx.buyer_id === user.id;
            const isSeller = tx.seller_id === user.id;
            if (!isBuyer && !isSeller) return null;

            const amountRaw = isSeller
              ? Number(tx.property_price || 0) - Number(tx.seller_fee || 0)
              : Number(tx.property_price || 0) + Number(tx.buyer_fee || 0);

            const type = isSeller ? "credit" : "debit";
            const note = tx.purpose ? `${tx.purpose} payment` : "Transaction";
            const status = tx.payment_status || tx.status;
            const dateLabel = tx.created_at
              ? new Date(tx.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
              : "";

            return {
              id: tx.id,
              type,
              amount: amountRaw,
              note: status ? `${note} • ${status}` : note,
              dateLabel,
            };
          })
          .filter(Boolean);

        setHistory(mapped);
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Could not load history";
        setHistoryError(msg);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [user?.id]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: 90, paddingBottom: 60 }}>
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ width: "100%" }}>
              <h1 style={{ margin: 0, textAlign: "center" }}>Money Box</h1>
              <div className="money-box-card">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, letterSpacing: 0.2, color: "#6b7280", textTransform: "uppercase" }}>Available Balance</div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: "#0f172a" }}>N0.00</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Last updated just now</div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
                  <button
                    className="profile-option-btn"
                    onClick={() => setShowAddModal(true)}
                    style={{ padding: "12px 18px", minWidth: 140, textAlign: "center" }}
                  >
                    Add Money
                  </button>

                  <button
                    className="profile-option-btn"
                    style={{ padding: "12px 18px", minWidth: 180, textAlign: "center" }}
                    onClick={() => setShowAccountModal(true)}
                  >
                    Account Number
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Recent activity</h3>
              <span style={{ color: "#6b7280", fontSize: 13 }}>{history.length} entries</span>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {historyLoading && <div>Loading history...</div>}
              {historyError && <div style={{ color: "#b91c1c" }}>{historyError}</div>}
              {!historyLoading && !historyError && history.length === 0 && <div>No activity yet.</div>}
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: item.type === "credit" ? "#f0fdf4" : "#fff7ed",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.note}</div>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>{item.dateLabel}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: item.type === "credit" ? "#15803d" : "#b45309" }}>
                    {item.type === "credit" ? "+" : "-"}₦{Number(item.amount || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showAddModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                zIndex: 60,
              }}
              role="dialog"
              aria-modal="true"
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 22,
                  width: "100%",
                  maxWidth: 440,
                  boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
                  position: "relative",
                  display: "grid",
                  gap: 14,
                  border: "1px solid #e5e7eb",
                }}
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    border: "none",
                    background: "#e2e8f0",
                    color: "#0f172a",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontWeight: 700,
                    boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
                  }}
                  aria-label="Close add money options"
                >
                  ×
                </button>

                <div style={{ textAlign: "center" }}>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: 18, fontWeight: 800 }}>Add Money</h3>
                  <p style={{ margin: "6px 0 0", color: "#4b5563", fontSize: 14 }}>
                    Choose how you want to fund your Money Box.
                  </p>
                </div>

                <button
                  className="profile-option-btn"
                  style={{ width: "100%", justifyContent: "center", padding: "12px 14px", fontWeight: 700 }}
                  onClick={() => {
                    setShowAddModal(false);
                    navigate("/payment-cards");
                  }}
                >
                  Fund your Money Box with bank card
                </button>

                <button
                  className="profile-option-btn"
                  style={{ width: "100%", justifyContent: "center", padding: "12px 14px", fontWeight: 700, background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe" }}
                  onClick={() => {
                    setShowAddModal(false);
                    setShowAccountModal(true);
                  }}
                >
                  Pay with bank transfer
                </button>
              </div>
            </div>
          )}

          {showAccountModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                zIndex: 50,
              }}
              role="dialog"
              aria-modal="true"
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 45%, #eef2ff 100%)",
                  borderRadius: 18,
                  padding: 24,
                  maxWidth: 520,
                  width: "100%",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
                  position: "relative",
                  display: "grid",
                  gap: 14,
                  border: "1px solid #e0e7ff",
                }}
              >
                <button
                  onClick={() => setShowAccountModal(false)}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    border: "none",
                    background: "#e2e8f0",
                    color: "#0f172a",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontWeight: 700,
                    boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
                  }}
                  aria-label="Close"
                >
                  ×
                </button>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      background: "rgba(67,56,202,0.08)",
                      color: "#4338ca",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 0.25,
                    }}
                  >
                    Virtual account
                  </span>
                </div>

                <h2 style={{ margin: 0, textAlign: "center", color: "#0f172a", fontSize: 20, fontWeight: 800 }}>
                  Your Smart Home Finder Personalized Account Number
                </h2>
                <p style={{ margin: 0, color: "#4b5563", textAlign: "center", fontSize: 14 }}>
                  Use this account to fund your Money Box at any time. Deposits reflect automatically.
                </p>
                <p style={{ margin: 0, color: "#6b7280", textAlign: "center", fontSize: 13 }}>
                  Automatic withdrawals from Money Box are not available.
                </p>

                {vaError && (
                  <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecdd3", borderRadius: 10, padding: 10, fontSize: 13 }}>
                    {vaError}
                  </div>
                )}

                <div
                  style={{
                    border: "1px solid #e0e7ff",
                    borderRadius: 14,
                    padding: 14,
                    display: "grid",
                    gap: 10,
                    background: "rgba(255,255,255,0.85)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280", fontSize: 13 }}>Account name</span>
                    <span style={{ color: "#0f172a", fontWeight: 700 }}>
                      {virtualAccount?.account_name || (vaLoading ? "Loading..." : "Unavailable")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280", fontSize: 13 }}>Account number</span>
                    <span style={{
                      color: "#111827",
                      fontWeight: 800,
                      letterSpacing: 0.6,
                      fontSize: 16,
                      fontFamily: "SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
                    }}>
                      {virtualAccount?.account_number || (vaLoading ? "Loading..." : "Unavailable")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280", fontSize: 13 }}>Bank</span>
                    <span style={{ color: "#0f172a", fontWeight: 700 }}>
                      {virtualAccount?.bank_name || (vaLoading ? "Loading..." : "Unavailable")}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "center", color: "#4338ca", fontWeight: 600, fontSize: 13 }}>
                  Keep this handy—transfers land in seconds via Paystack virtual accounts.
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default MoneyBoxScreen;
