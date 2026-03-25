import React, { useState } from 'react';
import '../styles/globalStyles.css';

const SearchFilter = ({ onSearch, initialValues = {} }) => {
  const [city, setCity] = useState(initialValues.city || '');
  const [minPrice, setMinPrice] = useState(initialValues.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || '');
  const [purpose, setPurpose] = useState(initialValues.purpose || 'any');

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ city, minPrice, maxPrice, purpose });
    }
  };

  const handleReset = () => {
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setPurpose('any');
    if (onSearch) onSearch({ city: '', minPrice: '', maxPrice: '', purpose: 'any' });
  };

  return (
    <div className="section">
      <div className="container">

    
    <div className="searchFilter-content modern-filter">
      <div className="searchFilter-row">
        <div className="input-container full">
          <label htmlFor="filter-city" className="filter-label">City or Area</label>
          <input
            type="text"
            id="filter-city"
            placeholder="e.g., Abuja"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="searchFilter-input city-input"
          />
        </div>
      </div>

      <div className="searchFilter-row">
        <div className="input-container full">
          <label htmlFor="filter-purpose" className="filter-label">Purpose</label>
          <select
            id="filter-purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="searchFilter-input"
          >
            <option value="any">Any</option>
            <option value="Rent">Rent</option>
            <option value="Sell">Buy</option>
          </select>
        </div>
      </div>

      <div className="searchFilter-row">
        <div className="input-container">
          <label htmlFor="filter-min-price" className="filter-label">Min Price (₦)</label>
          <input
            type="number"
            id="filter-min-price"
            placeholder="e.g., 5000000"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="searchFilter-input price-input"
          />
        </div>
        <div className="input-container">
          <label htmlFor="filter-max-price" className="filter-label">Max Price (₦)</label>
          <input
            type="number"
            id="filter-max-price"
            placeholder="e.g., 25000000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="searchFilter-input price-input"
          />
        </div>
      </div>

      <div className="searchFilter-actions">
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
        <button className="searchFilter-button" onClick={handleSearch}>
          Search
        </button>
      </div>
    </div>

        
    </div>
    </div>
  );
};

export default SearchFilter;
