import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { verifyPaystackPayment } from "../api/paymentService";
import { formatPrice } from "../utils/formatPrice";

const PaymentVerifyScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setError("No payment reference found.");
      setLoading(false);
      return;
    }
    const verify = async () => {
      try {
        const data = await verifyPaystackPayment(reference);
        setResult(data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Verification failed.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [reference]);

  const status = result?.transaction?.payment_status || result?.paystack?.status || "";
  const isSuccess = status === "success";
  const amount = result?.transaction
    ? Number(result.transaction.property_price || 0) + Number(result.transaction.buyer_fee || 0)
    : null;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60, minHeight: "70vh" }}>
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          {loading && <p style={{ marginTop: 40 }}>Verifying your payment...</p>}

          {error && (
            <div style={{ marginTop: 40, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecdd3", padding: 16, borderRadius: 10 }}>
              {error}
            </div>
          )}

          {!loading && result && (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  background: isSuccess ? "#dcfce7" : "#fef2f2",
                  color: isSuccess ? "#15803d" : "#b91c1c",
                }}
              >
                {isSuccess ? "✓" : "✕"}
              </div>

              <h1 style={{ marginBottom: 8 }}>
                {isSuccess ? "Payment Successful" : "Payment " + (status || "Failed")}
              </h1>

              {amount != null && (
                <p style={{ fontSize: 20, fontWeight: 700, margin: "8px 0" }}>
                  {formatPrice(amount)}
                </p>
              )}

              <p style={{ color: "#555", marginBottom: 4 }}>
                Reference: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>{reference}</code>
              </p>

              {result.mismatch && (
                <div style={{ marginTop: 12, padding: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#92400e" }}>
                  Amount mismatch detected. Our team will review this transaction.
                </div>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/")}
                  style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Back to Home
                </button>
                <button
                  onClick={() => navigate("/moneybox")}
                  style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "#111827", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  View Money Box
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PaymentVerifyScreen;
