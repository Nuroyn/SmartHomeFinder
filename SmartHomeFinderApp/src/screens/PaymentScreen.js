import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchPublicProperty } from "../api/propertyService";
import { initiatePaystackPayment } from "../api/paymentService";
import { useAuth } from "../context/UserContext";
import { formatPrice } from "../utils/formatPrice";

const BUYER_RATE = 0.05; // 5 % service fee (matches commission_settings defaults)

const PaymentScreen = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    const load = async () => {
      try {
        const data = await fetchPublicProperty(propertyId);
        if (!data) {
          setError("Property not found or not published.");
        }
        setProperty(data);
      } catch {
        setError("Could not load property details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propertyId, isLoggedIn, navigate]);

  const price = Number(property?.price) || 0;
  const buyerFee = price * BUYER_RATE;
  const total = price + buyerFee;
  const sellerRate = property?.purpose === "Sell" ? 0.05 : 0;
  const sellerFee = price * sellerRate;
  const sellerReceives = property?.purpose === "Sell" ? price - sellerFee : price;
  const image = Array.isArray(property?.images) ? property.images[0] : null;

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    setError("");
    try {
      const res = await initiatePaystackPayment(propertyId);
      const authUrl = res?.authorizationUrl;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        setError("No Paystack authorization URL returned.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Payment initiation failed.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60, minHeight: "70vh" }}>
        <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ marginBottom: 16, padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            ← Back
          </button>

          <h1 style={{ marginBottom: 4 }}>Checkout</h1>
          <p style={{ marginTop: 0, color: "#555" }}>
            Review the fee breakdown before completing your payment.
          </p>

          {loading && <p>Loading property details...</p>}
          {error && (
            <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecdd3", padding: 12, borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {!loading && property && (
            <>
              {/* Property summary */}
              <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                {image && (
                  <img
                    src={image}
                    alt={property.name}
                    style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{property.name}</div>
                  <div style={{ color: "#555", fontSize: 14 }}>{property.location}</div>
                  <div style={{ marginTop: 4, fontSize: 14 }}>
                    <span style={{ background: "#eef2ff", color: "#4338ca", padding: "2px 8px", borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                      {property.purpose}
                    </span>
                    {property.property_type && (
                      <span style={{ marginLeft: 6, background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                        {property.property_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee breakdown */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Fee Breakdown</h3>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#555" }}>Property price</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(price)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#555" }}>Service fee ({(BUYER_RATE * 100).toFixed(0)}%)</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(buyerFee)}</span>
                  </div>
                  <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>You pay</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>{formatPrice(total)}</span>
                  </div>
                </div>

                {property.purpose === "Sell" && (
                  <div style={{ marginTop: 12, padding: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#92400e" }}>
                    Seller receives {formatPrice(sellerReceives)} after a {(sellerRate * 100).toFixed(0)}% seller fee ({formatPrice(sellerFee)}).
                  </div>
                )}
              </div>

              {/* Security note */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: "#166534" }}>
                Payments are processed securely via Paystack. Your card details are handled entirely by Paystack and never touch our servers.
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={paying}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: paying ? "#9ca3af" : "#111827",
                  color: "#fff",
                  cursor: paying ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {paying ? "Redirecting to Paystack..." : `Pay ${formatPrice(total)} with Paystack`}
              </button>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PaymentScreen;
