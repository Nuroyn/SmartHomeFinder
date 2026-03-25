import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import '../styles/globalStyles.css';
import PropertyCard from '../components/PropertyCard';
import ImgCard from '../components/imgCard';
import SearchFilter from '../components/SearchFilter';
import Help from '../components/Help';
import StartNow from '../components/StartNow';
import Footer from '../components/Footer';
import { fetchPublicProperties } from '../api/propertyService';
import { fetchWishlistIds, addToWishlist, removeFromWishlist } from '../api/wishlistService';
import { useAuth } from '../context/UserContext';

const ITEMS_PER_PAGE = 12;

const HomeScreen = () => {

  const { isLoggedIn } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicProperties();
        setProperties(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.error('Home fetch error:', err.response || err.message);
        setError('Could not load properties.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchWishlistIds()
      .then((ids) => setWishlistedIds(new Set(ids)))
      .catch(() => {});
  }, [isLoggedIn]);

  const handleToggleWishlist = async (propertyId) => {
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="home-container">
     

      <Header />
      <SearchFilter onSearch={(filters) => {
        const city = filters.city?.toLowerCase().trim();
        const min = filters.minPrice ? Number(filters.minPrice) : null;
        const max = filters.maxPrice ? Number(filters.maxPrice) : null;

        const next = (properties || []).filter((p) => {
          const matchesCity = city ? (p.location || "").toLowerCase().includes(city) : true;
          const priceNum = Number(p.price);
          const matchesMin = min !== null ? priceNum >= min : true;
          const matchesMax = max !== null ? priceNum <= max : true;
          return matchesCity && matchesMin && matchesMax;
        });

        setFiltered(next);
        setPage(1);
      }} />
      <ImgCard />
      {loading && (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#555' }} role="status" aria-live="polite">Loading properties...</div>
      )}
      {error && (
        <div role="alert" style={{ color: '#a00', background: '#fee', padding: 8, borderRadius: 6, margin: '12px auto', maxWidth: 960 }}>
          {error}
        </div>
      )}
      <PropertyCard properties={paged} wishlistedIds={wishlistedIds} onToggleWishlist={handleToggleWishlist} />
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', margin: '0 0 2rem' }}>
          <button
            className="property-button"
            disabled={page <= 1}
            aria-label="Go to previous page"
            onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
          >
            Previous
          </button>
          <span style={{ fontSize: 14, color: '#555' }} aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <button
            className="property-button"
            disabled={page >= totalPages}
            aria-label="Go to next page"
            onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
          >
            Next
          </button>
        </div>
      )}
      <StartNow />
      <Help />
      <Footer />

    </div>
  );
};

export default HomeScreen;
