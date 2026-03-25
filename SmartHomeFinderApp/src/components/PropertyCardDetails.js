import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/globalStyles.css'; // Import styles for the component
import { formatPrice } from '../utils/formatPrice';


// PropertyCard component which will receive property details as props
const PropertyCardDetails = ({ cardDetails, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate();
  // Support both API payload shape and local fallback data
  const title = cardDetails.title || cardDetails.name || "Property Details";
  const description = cardDetails.description || "";
  const price = formatPrice(cardDetails.price);
  const location = cardDetails.location || "";
  const imageUrl = Array.isArray(cardDetails.images)
    ? cardDetails.images[0]
    : cardDetails.imageUrl;
  const displayImage = imageUrl
  const detailId = cardDetails.id || cardDetails._id;

  return (
    <div className="property-card card-base">
      {/* Property Image */}
      <div style={{ position: 'relative' }}>
        <img src={displayImage} alt={title} className="property-image card-image" />
        {onToggleWishlist && (
          <button
            className="wishlist-heart-btn"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(detailId); }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      {/* Property Information */}
      <div className="property-info card-content">
        {/* Title */}
        <h3 className="property-title">{title}</h3>
        
        {/* Description */}
        <p className="property-description">{description}</p>
        
        {/* Price */}
        <p className="property-price">{price}</p>
        
        {/* Location */}
        <p className="property-location">{location}</p>

        {/* Button to view more details */}
        <button
          className="property-button"
          onClick={() => navigate(`/property/${detailId}`)}
          disabled={!detailId}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCardDetails;
