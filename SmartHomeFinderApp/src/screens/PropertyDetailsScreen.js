import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchPublicProperty } from "../api/propertyService";
import { formatPrice } from "../utils/formatPrice";
import { useAuth } from "../context/UserContext";

const parseLatLng = (verifyLocation, location) => {
  if (verifyLocation && typeof verifyLocation === "string") {
    const parts = verifyLocation.split(",").map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
  }
  if (location) {
    return { query: location };
  }
  return null;
};

const amenityLinks = (coord) => {
  if (!coord) return [];
  const base = coord.query
    ? `https://www.google.com/maps/search/`
    : `https://www.google.com/maps/search/?api=1&query=`;
  const q = coord.query || `${coord.lat},${coord.lng}`;
  const categories = [
    { label: "Schools", term: "schools" },
    { label: "Hospitals", term: "hospitals" },
    { label: "Markets", term: "markets" },
    { label: "Police Stations", term: "police stations" },
    { label: "Gas Stations", term: "gas stations" },
    { label: "Churches", term: "churches" },
    { label: "Mosques", term: "mosques" },
  ];
  return categories.map((c) => ({
    label: c.label,
    url: coord.query
      ? `${base}${encodeURIComponent(`${c.term} near ${q}`)}`
      : `${base}${encodeURIComponent(`${c.term} near ${q}`)}`,
  }));
};

const distanceMeters = (a, b) => {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDlat = Math.sin(dLat / 2);
  const sinDlng = Math.sin(dLng / 2);
  const h = sinDlat * sinDlat + sinDlng * sinDlng * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const buildAmenityQuery = (lat, lng) => {
  const radius = 1500;
  const filters = '"amenity"~"school|hospital|marketplace|police|fuel|place_of_worship"';
  return `[out:json][timeout:25];(node[${filters}](around:${radius},${lat},${lng});way[${filters}](around:${radius},${lat},${lng});relation[${filters}](around:${radius},${lat},${lng}););out center 60;`;
};

const normalizeAmenity = (el) => {
  const tags = el.tags || {};
  const name = tags.name || tags.ref || "Unnamed";
  const amenity = tags.amenity || "other";
  const center = el.center || { lat: el.lat, lng: el.lon };
  const lat = center.lat;
  const lng = center.lon || center.lng;
  return { id: `${el.type}-${el.id}`, name, amenity, lat, lng };
};

const parseVideoSource = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const url = raw.trim();

  // Prefer Cloudinary, but allow any http(s) video URL as fallback
  const isCloudinary = /cloudinary\.com|res\.cloudinary\.com/i.test(url);
  if (isCloudinary) return { type: "cloudinary", src: url };

  if (/^https?:\/\//i.test(url)) {
    return { type: "direct", src: url };
  }

  return null;
};

const PropertyDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amenities, setAmenities] = useState({ loading: false, data: [], error: null });
  const [slideIndex, setSlideIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPublicProperty(id);
        if (!result) {
          setError("Property not found or not published.");
        }
        setProperty(result || null);
      } catch (err) {
        console.error("Property details fetch error", err.response || err.message);
        setError("Could not load property.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    setSlideIndex(0);
    setShowTour(false);
  }, [property?.id]);

  const coord = useMemo(
    () => parseLatLng(property?.verify_location, property?.location),
    [property]
  );
  const heading = property?.name || "Property Details";
  const links = useMemo(() => amenityLinks(coord), [coord]);
  const images = property?.images || [];
  const hasVideo = Boolean(property?.video_url);
  const videoSource = useMemo(() => (hasVideo ? parseVideoSource(property.video_url) : null), [hasVideo, property?.video_url]);

  useEffect(() => {
    if (!coord || coord.query) return; // need lat/lng to call Overpass
    const fetchAmenities = async () => {
      setAmenities({ loading: true, data: [], error: null });
      try {
        const query = buildAmenityQuery(coord.lat, coord.lng);
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
        });
        if (!res.ok) throw new Error(`Overpass error ${res.status}`);
        const json = await res.json();
        const items = (json.elements || []).map(normalizeAmenity).filter((a) => a.lat && a.lng);
        const withDistance = items.map((a) => ({
          ...a,
          distance: Math.round(distanceMeters({ lat: coord.lat, lng: coord.lng }, { lat: a.lat, lng: a.lng })),
        }));
        const deduped = new Map();
        for (const item of withDistance) {
          if (!deduped.has(item.id)) deduped.set(item.id, item);
        }
        const sorted = Array.from(deduped.values()).sort((a, b) => a.distance - b.distance).slice(0, 20);
        setAmenities({ loading: false, data: sorted, error: null });
      } catch (err) {
        console.error("Amenity lookup error", err);
        setAmenities({ loading: false, data: [], error: "Could not load nearby amenities." });
      }
    };
    fetchAmenities();
  }, [coord]);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 90, minHeight: "70vh", paddingInline: 16, maxWidth: 1100, margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ marginBottom: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
        >
          ← Back
        </button>
        {loading && <p>Loading property...</p>}
        {error && (
          <div style={{ color: "#a00", background: "#fee", padding: 10, borderRadius: 6 }}>{error}</div>
        )}
        {!loading && property && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{ margin: 0 }}>{heading}</h1>
            <div style={{ color: "#555" }}>{property.location}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{formatPrice(property.price)}</span>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate("/login");
                    return;
                  }
                  navigate(`/checkout/${property.id}`);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "#111827",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {property.purpose === "Rent" ? "Rent Now" : "Buy Now"}
              </button>
            </div>

            {(images.length > 0 || property.video_url) && (
              <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 8 }}>
                {!showTour && images.length > 0 && (
                  <div style={{ position: "relative" }}>
                    <img
                      src={images[slideIndex]}
                      alt={`${property.name || "property"}-img-${slideIndex}`}
                      style={{ width: "100%", maxHeight: 440, objectFit: "cover", borderRadius: 10 }}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSlideIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: 12,
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            width: 34,
                            height: 34,
                            cursor: "pointer",
                          }}
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setSlideIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: 12,
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            width: 34,
                            height: 34,
                            cursor: "pointer",
                          }}
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                )}

                {showTour && hasVideo && videoSource?.type === "cloudinary" && (
                  <video
                    src={videoSource?.src}
                    controls
                    autoPlay
                    style={{ width: "100%", maxHeight: 440, borderRadius: 10, background: "#000" }}
                  />
                )}
                {showTour && hasVideo && videoSource?.type === "direct" && (
                  <video
                    src={videoSource?.src}
                    controls
                    autoPlay
                    style={{ width: "100%", maxHeight: 440, borderRadius: 10, background: "#000" }}
                  />
                )}
                {showTour && hasVideo && videoSource?.type === "youtube" && (
                  <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", background: "#000" }}>
                    <iframe
                      title="Property Tour"
                      src={`${videoSource.embed}?autoplay=1&rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                    />
                  </div>
                )}
                {showTour && !hasVideo && (
                  <div style={{ padding: 12, color: "#a00" }}>No video tour available.</div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    onClick={() => {
                      if (!hasVideo && !showTour) return;
                      setShowTour((v) => !v);
                    }}
                    disabled={!hasVideo}
                    style={{
                      background: "#265b3d",
                      color: "#fff",
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: 10,
                      cursor: hasVideo ? "pointer" : "not-allowed",
                      fontWeight: 700,
                      opacity: hasVideo ? 1 : 0.6,
                    }}
                  >
                    {showTour ? "Property Images" : "Property Tour"}
                  </button>
                </div>

                {!showTour && images.length > 1 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSlideIndex(idx)}
                        style={{
                          border: idx === slideIndex ? "2px solid #265b3d" : "1px solid #ccc",
                          padding: 2,
                          borderRadius: 8,
                          background: "#fff",
                          cursor: "pointer",
                        }}
                        aria-label={`Go to image ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`thumb-${idx}`}
                          style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, display: "block" }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <section style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <h3>Description</h3>
              <p style={{ marginTop: 8 }}>{property.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: 10, fontSize: 14, color: "#444" }}>
                <div>Type: {property.property_type || "-"}</div>
                <div>Purpose: {property.purpose || "-"}</div>
                <div>Bedrooms: {property.num_bedrooms ?? "-"}</div>
                <div>Bathrooms: {property.num_bathrooms ?? "-"}</div>
                <div>Land size: {property.land_size ?? "-"}</div>
                <div>Year built: {property.year_built ?? "-"}</div>
                <div>Garage: {property.has_garage ? "Yes" : "No"}</div>
              </div>
            </section>

            <section style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <h3>Amenities nearby</h3>
              {coord ? (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                    {links.map((l) => (
                      <a
                        key={l.label}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "8px 10px",
                          background: "#265b3d",
                          color: "#fff",
                          borderRadius: 8,
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    {amenities.loading && <p>Scanning nearby amenities…</p>}
                    {amenities.error && (
                      <p style={{ color: "#a00" }}>{amenities.error}</p>
                    )}
                    {!amenities.loading && !amenities.error && amenities.data.length === 0 && (
                      <p style={{ color: "#666" }}>No amenities found within 1.5 km.</p>
                    )}
                    {!amenities.loading && amenities.data.length > 0 && (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                        {amenities.data.map((a) => (
                          <li key={a.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                            <div style={{ fontWeight: 700 }}>{a.name}</div>
                            <div style={{ fontSize: 13, color: "#555" }}>
                              Type: {a.amenity.replace(/_/g, " ")}
                            </div>
                            <div style={{ fontSize: 13, color: "#555" }}>
                              ~{a.distance} m away
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.name} near ${coord.lat},${coord.lng}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 12, color: "#0a74ff", textDecoration: "underline" }}
                            >
                              View on map
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: "#666" }}>No captured location yet.</p>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default PropertyDetailsScreen;