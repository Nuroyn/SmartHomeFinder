import React from 'react';
import PropertyCardDetails from './PropertyCardDetails';

const PropertyCard = ({ properties = [], wishlistedIds = new Set(), onToggleWishlist }) => {
  // Prefer live data; fall back to local sample list
  const items = properties.length ? properties : [];
  return (
    <div className="section">
      <div className="container">
        <div className="property-card-title">
          <h2 className="section-title">Discover Your Next Home</h2>
        </div>
        
          <div className="property-card-flex-container">
            {items.map((cardDetails) => (
              <PropertyCardDetails
                key={cardDetails.id || cardDetails.name}
                cardDetails={cardDetails}
                isWishlisted={wishlistedIds.has(cardDetails.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
            
          </div>
        </div>
    </div>

  );
};

export default PropertyCard;
