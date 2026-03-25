import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchWishlist, removeFromWishlist } from "../api/wishlistService";
import "../styles/globalStyles.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80";

export default function WishlistScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWishlist();
        setItems(data);
      } catch {
        setError("Could not load your wishlist.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (propertyId) => {
    setItems((prev) => prev.filter((p) => p.id !== propertyId));
    try {
      await removeFromWishlist(propertyId);
    } catch {
      // reload on failure
      const data = await fetchWishlist();
      setItems(data);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ margin: "0 0 8px" }}>My Wishlist</h1>
          <p style={{ color: "#556079", margin: "0 0 24px" }}>
            {items.length} {items.length === 1 ? "property" : "properties"} saved
          </p>

          {loading && <p role="status" aria-live="polite">Loading wishlist...</p>}
          {error && (
            <div role="alert" style={{ color: "#a00", background: "#fee", padding: 10, borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🤍</p>
              <h2 style={{ color: "#1a3c34", margin: "0 0 8px" }}>No saved properties yet</h2>
              <p style={{ color: "#556079", marginBottom: 24 }}>
                Tap the heart on any property to save it here.
              </p>
              <button className="property-button" onClick={() => navigate("/")}>
                Browse Properties
              </button>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {items.map((p) => {
                const image =
                  (Array.isArray(p.images) && p.images[0]) ||
                  p.property_doc ||
                  fallbackImage;

                return (
                  <div
                    key={p.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={image}
                        alt={p.name || "Property"}
                        style={{ width: "100%", height: 180, objectFit: "cover", cursor: "pointer" }}
                        onClick={() => navigate(`/property/${p.id}`)}
                      />
                      <button
                        className="wishlist-heart-btn"
                        onClick={() => handleRemove(p.id)}
                        aria-label="Remove from wishlist"
                      >
                        ❤️
                      </button>
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                        {p.name || "Property"}
                      </div>
                      <div style={{ color: "#556079", fontSize: 14 }}>
                        {p.location || "Location available"}
                      </div>
                      <div style={{ color: "#0a7a4a", fontWeight: 700, marginTop: 8 }}>
                        {p.price ? `₦${Number(p.price).toLocaleString()}` : "Price on request"}
                      </div>
                      <button
                        className="property-button"
                        style={{ marginTop: 12, width: "100%" }}
                        onClick={() => navigate(`/property/${p.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
