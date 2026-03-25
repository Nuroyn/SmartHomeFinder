import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/globalStyles.css";

const StickyBoard = ({
  onHistory,
  onWishlist,
  onAccount,
}) => {
  const navigate = useNavigate();

  const handleHistory = () => {
    if (onHistory) {
      onHistory();
    } else {
      navigate("/history");
    }
  };

  const handleWishlist = () => {
    if (onWishlist) {
      onWishlist();
    } else {
      navigate("/wishlist");
    }
  };

  const handleAccount = () => {
    if (onAccount) {
      onAccount();
    } else {
      navigate("/profile");
    }
  };

  return (
    <nav className="sticky-board" aria-label="Quick actions">
      <button type="button" className="sticky-item" onClick={handleHistory}>
        <span className="sticky-icon" aria-hidden>🕓</span>
        <span className="sticky-label">History</span>
      </button>
      <button type="button" className="sticky-item" onClick={handleWishlist}>
        <span className="sticky-icon" aria-hidden>⭐</span>
        <span className="sticky-label">Wishlist</span>
      </button>
      <button type="button" className="sticky-item" onClick={handleAccount}>
        <span className="sticky-icon" aria-hidden>👤</span>
        <span className="sticky-label">Account</span>
      </button>
    </nav>
  );
};

export default StickyBoard;
