import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchMyProperties, updateVerifyLocation } from "../api/propertyService";

const statusLabel = (p) => {
  if (p.is_published) return "Published";
  if (p.is_approved) return "Approved";
  return "Pending / Rejected"; // backend does not distinguish pending vs rejected
};

const HistoryScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifications, setVerifications] = useState({});

  const handleVerifyLocation = (property) => {
    const proceed = window.confirm(
      "Make sure you are at this property location before clicking on continue"
    );
    if (!proceed) return;

    if (!navigator.geolocation) {
      setVerifications((prev) => ({
        ...prev,
        [property.id]: { status: "error", message: "Geolocation not supported on this device" },
      }));
      return;
    }

    setVerifications((prev) => ({
      ...prev,
      [property.id]: { status: "pending", message: "Capturing location..." },
    }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await updateVerifyLocation(property.id, { latitude, longitude });
          setItems((prev) =>
            prev.map((p) =>
              p.id === property.id
                ? { ...p, verify_location: `${latitude},${longitude}` }
                : p
            )
          );
          setVerifications((prev) => ({
            ...prev,
            [property.id]: {
              status: "ok",
              message: `Captured & saved: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            },
          }));
        } catch (err) {
          setVerifications((prev) => ({
            ...prev,
            [property.id]: {
              status: "error",
              message: err.response?.data?.message || "Failed to save location",
            },
          }));
        }
      },
      (err) => {
        setVerifications((prev) => ({
          ...prev,
          [property.id]: { status: "error", message: err.message || "Unable to capture location" },
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyProperties();
        setItems(data || []);
      } catch (err) {
        console.error("History fetch error", err.response || err.message);
        setError("Could not load history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 90, minHeight: "60vh", paddingInline: 16, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 12 }}>History</h1>
        <p style={{ marginTop: 0, color: "#555" }}>
          Your uploaded properties with their current status. Deleted entries no longer appear here.
        </p>
        {error && (
          <div style={{ color: "#a00", background: "#fee", padding: 10, borderRadius: 6, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 10, background: "white", color: "#555" }}>
            No uploads yet. Landlords will see their submitted properties here once added.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {items.map((p) => (
              <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "white" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} style={{ width: 80, height: 70, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 80, height: 70, borderRadius: 8, background: "#f0f0f0" }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{p.location}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>Price: {p.price}</div>
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  Status: <span style={{ fontWeight: 700 }}>{statusLabel(p)}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
                  Approved: {p.is_approved ? "Yes" : "No"} · Published: {p.is_published ? "Yes" : "No"}
                </div>
                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleVerifyLocation(p)}
                    style={{
                      padding: "8px 10px",
                      background: "#c4b152",
                      color: "#1a3a2a",
                      borderRadius: 8,
                      border: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Verify property location
                  </button>
                </div>
                {verifications[p.id] && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color:
                        verifications[p.id].status === "ok"
                          ? "#1a7f37"
                          : verifications[p.id].status === "pending"
                          ? "#555"
                          : "#b20000",
                    }}
                  >
                    {verifications[p.id].message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default HistoryScreen;
