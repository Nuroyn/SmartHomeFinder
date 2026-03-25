import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchFilter from "../components/SearchFilter";
import PropertyCardDetails from "../components/PropertyCardDetails";
import { searchProperties } from "../api/propertyService";
import "../styles/globalStyles.css";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const q = searchParams.get("q") || "";
  const purpose = searchParams.get("purpose") || "any";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchProperties({ q, purpose, minPrice, maxPrice, page });
      setProperties(data.properties || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError("Failed to load search results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [q, purpose, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [q, purpose, minPrice, maxPrice]);

  const handleFilterSearch = ({ city, minPrice: min, maxPrice: max, purpose: p }) => {
    const params = new URLSearchParams();
    if (city) params.set("q", city);
    if (p && p !== "any") params.set("purpose", p);
    if (min) params.set("minPrice", min);
    if (max) params.set("maxPrice", max);
    setSearchParams(params);
  };

  return (
    <>
      <Navbar />
      <div className="section" style={{ minHeight: "60vh", paddingTop: "2rem" }}>
        <div className="container">
          <h2 className="section-title">
            {q ? `Results for "${q}"` : "All Properties"}
            {total > 0 && <span style={{ fontSize: "1rem", fontWeight: 400, marginLeft: 8 }} aria-live="polite">({total} found)</span>}
          </h2>

          <SearchFilter
            onSearch={handleFilterSearch}
            initialValues={{ city: q, minPrice, maxPrice, purpose }}
          />

          {loading && <p style={{ textAlign: "center", padding: "2rem" }} role="status" aria-live="polite">Loading...</p>}

          {error && <p style={{ textAlign: "center", color: "red", padding: "2rem" }} role="alert">{error}</p>}

          {!loading && !error && properties.length === 0 && (
            <p style={{ textAlign: "center", padding: "2rem" }}>
              No properties found. Try adjusting your search filters.
            </p>
          )}

          {!loading && !error && properties.length > 0 && (
            <>
              <div className="property-list">
                {properties.map((p) => (
                  <PropertyCardDetails key={p.id} cardDetails={p} />
                ))}
              </div>

              {pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", margin: "2rem 0" }}>
                  <button
                    className="property-button"
                    disabled={page <= 1}
                    aria-label="Go to previous page"
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: "center" }} aria-live="polite">
                    Page {page} of {pages}
                  </span>
                  <button
                    className="property-button"
                    disabled={page >= pages}
                    aria-label="Go to next page"
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;
