import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/globalStyles.css";

const quickFilters = [
  { label: "Buy", href: "/#buy" },
  { label: "Sell", href: "/#sell" },
  { label: "Rent", href: "/#rent" },
  { label: "Value your property", href: "/property-request" },
];

const Header = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [purpose, setPurpose] = useState("any");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim()) params.append("q", city.trim());
    if (purpose !== "any") params.append("purpose", purpose);
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header className="header-container">
      <div className="header-overlay" />

      <div className="header-inner">
        <div className="header-title">
          <p className="header-kicker">SmartHomeFinder</p>
          <h1>Find the right home, transparent 5% fees, trusted checks.</h1>
          <p className="header-sub">
            Verified landlords, admin-reviewed listings, and upfront pricing for rent and sale with a simple 5% service fee.
          </p>
        </div>

        <div className="header-buttons">
          <ul>
            {quickFilters.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="searchbar-shell">
          <div className="searchbar-container" role="search" aria-label="Property search">
            <label htmlFor="header-purpose" className="sr-only">Purpose</label>
            <select
              id="header-purpose"
              className="searchbar-select"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="any">Any</option>
              <option value="Rent">Rent</option>
              <option value="Sell">Buy</option>
            </select>
            <label htmlFor="header-search" className="sr-only">Search by city or area</label>
            <input
              type="text"
              id="header-search"
              placeholder="Search by city or area"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              className="searchbar-input"
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>
          <div className="search-hint">Admin-approved listings • Media verified • Clear commissions</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
