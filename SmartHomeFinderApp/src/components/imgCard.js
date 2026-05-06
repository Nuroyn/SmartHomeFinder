// components/ImgCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import ImgCardDetails from "./ImgCardDetails";
import { fetchPublicProperties } from "../api/propertyService";
import fallbackCards from "../data/imgCardList";

const fallbackImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80";

const titleByType = {
  apartment: "Apartments",
  blockOfFlat: "Apartments",
  studio: "Apartments",
  villa: "Luxury Homes",
  bungalow: "Bungalows",
  land: "Land",
  penthouse: "Luxury Homes",
  duplex: "Luxury Homes",
  SemiDetachedHouse: "Luxury Homes",
  terracedHouse: "Terraced Homes",
  detachedHouse: "Luxury Homes",
  mansion: "Luxury Homes",
  maisonette: "Luxury Homes",
  traditionalHouse: "Traditional Homes",
  commercialBuilding: "Commercial",
  industrialProperty: "Commercial",
  mixedUseBuilding: "Mixed Use",
  recreationalLand: "Land",
  agriculturalLand: "Land",
  officeSpace: "Commercial",
  retailSpace: "Commercial",
  warehouse: "Commercial",
};

const displayOrder = [
  "Recommended for you",
  "New Listings",
  "New Constructions",
  "Reduced Price",
  "Luxury Homes",
  "Apartments",
  "Land",
  "Commercial",
];

const toSlug = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "category";

export default function ImgCard() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const properties = await fetchPublicProperties();

        // Group by display title
        const bucket = new Map();
        properties.forEach((p) => {
          const rawType = p.property_type || p.propertyType;
          const title = titleByType[rawType] || "Recommended for you";
          const existing = bucket.get(title) || { count: 0, sample: null };
          const image =
            (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
            p.property_doc ||
            fallbackImage;
          bucket.set(title, {
            count: existing.count + 1,
            sample: existing.sample || {
              id: p.id,
              imageUrl: image,
              location: p.location,
            },
          });
        });

        const mapped = displayOrder
          .map((title, idx) => {
            const data = bucket.get(title);
            if (!data) return null;
            return {
              title,
              bage: String(data.count),
              imageUrl: data.sample?.imageUrl || fallbackImage,
              slug: toSlug(title),
              sampleId: data.sample?.id || idx,
            };
          })
          .filter(Boolean);

        setCards(mapped);
      } catch (_err) {
        setCards(fallbackCards);
      }
    };

    load();
  }, []);

  const list = useMemo(() => (cards.length ? cards : fallbackCards), [cards]);

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Browse Homes by Category</h2>
        </div>

        <div className="img-cards-flex-container">
          {list.map((cardDetails) => (
            <ImgCardDetails
              key={cardDetails.slug}
              slug={cardDetails.slug}
              title={cardDetails.title}
              bage={cardDetails.bage}
              imageUrl={cardDetails.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
