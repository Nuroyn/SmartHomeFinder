import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchPublicProperties } from "../api/propertyService";
import { fetchWishlistIds, addToWishlist, removeFromWishlist } from "../api/wishlistService";
import { useAuth } from "../context/UserContext";

const ITEMS_PER_PAGE = 12;

const categoryTypes = {
  apartments: ["apartment", "blockOfFlat", "studio"],
  "new-listings": null, // special: show recents
  "new-constructions": ["new construction", "new-construction"], // fallback to recent if none
  "reduced-price": null, // placeholder: if we had discount flag
  "luxury-homes": [
    "villa",
    "duplex",
    "penthouse",
    "mansion",
    "maisonette",
    "SemiDetachedHouse",
    "detachedHouse",
  ],
  land: ["land", "recreationalLand", "agriculturalLand"],
  commercial: [
    "warehouse",
    "officeSpace",
    "retailSpace",
    "commercialBuilding",
    "industrialProperty",
    "mixedUseBuilding",
  ],
};

const titleFromSlug = (slug) =>
  (slug || "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

const fallbackImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80";

export default function CategoryScreen() {
  const { slug } = useParams();
  const { isLoggedIn } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const title = titleFromSlug(slug);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const props = await fetchPublicProperties();
        setProperties(props || []);
      } catch (err) {
        setError("Could not load properties. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchWishlistIds()
      .then((ids) => setWishlistedIds(new Set(ids)))
      .catch(() => {});
  }, [isLoggedIn]);

  const handleToggleWishlist = async (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    const next = new Set(wishlistedIds);
    if (next.has(propertyId)) {
      next.delete(propertyId);
      setWishlistedIds(next);
      try { await removeFromWishlist(propertyId); } catch { setWishlistedIds(wishlistedIds); }
    } else {
      next.add(propertyId);
      setWishlistedIds(next);
      try { await addToWishlist(propertyId); } catch { setWishlistedIds(wishlistedIds); }
    }
  };

  // Reset page when category changes
  useEffect(() => { setPage(1); }, [slug]);

  const filtered = useMemo(() => {
    if (!properties || !properties.length) return [];
    const types = categoryTypes[slug];

    // Special handling for "new listings" or null type: show recent
    if (!types) {
      return [...properties].sort((a, b) =>
        (b.created_at || 0) > (a.created_at || 0) ? 1 : -1
      );
    }

    return properties.filter((p) => types.includes(p.property_type || p.propertyType));
  }, [properties, slug]);

  const list = filtered.length ? filtered : properties;
  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  const paged = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ margin: 0 }}>{title}</h1>
            {filtered.length ? (
              <p style={{ margin: "6px 0 0", color: "#556079" }}>
                {filtered.length} properties in this category
              </p>
            ) : (
              <p style={{ margin: "6px 0 0", color: "#556079" }}>
                Showing all properties (no direct matches yet)
              </p>
            )}
          </div>

          {loading && <p role="status" aria-live="polite">Loading properties...</p>}
          {error && (
            <div role="alert" style={{ color: "#a00", background: "#fee", padding: 10, borderRadius: 8 }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {paged.map((p) => {
                const image =
                  (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
                  p.property_doc ||
                  fallbackImage;

                return (
                  <Link
                    key={p.id}
                    to={`/property/${p.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
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
                        style={{ width: "100%", height: 180, objectFit: "cover" }}
                      />
                      {isLoggedIn && (
                        <button
                          className="wishlist-heart-btn"
                          onClick={(e) => handleToggleWishlist(e, p.id)}
                          aria-label={wishlistedIds.has(p.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {wishlistedIds.has(p.id) ? "❤️" : "🤍"}
                        </button>
                      )}
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
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", margin: "2rem 0" }}>
                <button
                  className="property-button"
                  disabled={page <= 1}
                  aria-label="Go to previous page"
                  onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 14, color: "#555" }} aria-live="polite">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="property-button"
                  disabled={page >= totalPages}
                  aria-label="Go to next page"
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  Next
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
