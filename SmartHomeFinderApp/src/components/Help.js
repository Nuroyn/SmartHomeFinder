import React, { useState } from "react";
import "../styles/globalStyles.css";
import { icons } from "../icons";

const TABS = ["buying", "selling", "renting"];

const Help = () => {
  const [activeSection, setActiveSection] = useState("buying");

  const handleKeyDown = (e) => {
    const idx = TABS.indexOf(activeSection);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = TABS[(idx + 1) % TABS.length];
      setActiveSection(next);
      document.getElementById(`tab-${next}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
      setActiveSection(prev);
      document.getElementById(`tab-${prev}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveSection(TABS[0]);
      document.getElementById(`tab-${TABS[0]}`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveSection(TABS[TABS.length - 1]);
      document.getElementById(`tab-${TABS[TABS.length - 1]}`)?.focus();
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title-help" id="help-heading">Discover how we can help</h2>
        <div className="help-buttons-container" role="tablist" aria-labelledby="help-heading" onKeyDown={handleKeyDown}>
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              role="tab"
              aria-selected={activeSection === tab}
              aria-controls={`panel-${tab}`}
              tabIndex={activeSection === tab ? 0 : -1}
              className={`help-button ${activeSection === tab ? "active" : ""}`}
              onClick={() => setActiveSection(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Buying Section */}
        <div
          id="panel-buying"
          role="tabpanel"
          aria-labelledby="tab-buying"
          hidden={activeSection !== "buying"}
          className={`help-container-buying ${
            activeSection === "buying" ? "help-container-active" : ""
          }`}
        >
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Find out if it's better to rent or buy</h3>

              <icons.MdCompareArrows
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>
            <p>
              We'll help you estimate your budget range. Save to your buyer
              profile to help in your search.
            </p>
            <a href="/affordability-calculator" className="help-link">
              Try our affordability calculator
            </a>
          </div>
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Understand your monthly costs</h3>
              <icons.MdOutlineCalculate
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>
            <p>
              Get an in-depth look at what your monthly and closing costs will
              look like based on your financial situation and goals.
            </p>
            <a href="/mortgage-calculator" className="help-link">
              Try our mortgage calculator
            </a>
          </div>
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Get help with your down payment</h3>
              <icons.MdPayment
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>

            <p>
              You may be able to buy a home with just 3.5% down. Saving for that
              can be challenging—down payment assistance programs can help.
            </p>
            <a href="/down-payment-help" className="help-link">
              Find down payment help
            </a>
          </div>
        </div>

        {/* Selling Section */}
        <div
          id="panel-selling"
          role="tabpanel"
          aria-labelledby="tab-selling"
          hidden={activeSection !== "selling"}
          className={`help-container-selling ${
            activeSection === "selling" ? "help-container-active" : ""
          }`}
        >
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Get your home ready to sell</h3>
              <icons.MdSell
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>

            <p>
              Skip the repairs and showings. Our partners can help you buy your
              new home first, then sell your old one.
            </p>
            <a href="/affordability-calculator" className="help-link">
              Search options from our partners
            </a>
          </div>
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Sell your home faster</h3>
              <icons.MdHome
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>

            <p>
              See your RealEstimate℠ valuation information over time compared to
              homes in your area.
            </p>
            <a href="/mortgage-calculator" className="help-link">
              Get your RealEstimate℠
            </a>
          </div>
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Connect with a real estate agent</h3>
              <icons.MdRealEstateAgent
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>

            <p>
              Visit Seller’s Marketplace to find out how you can sell without
              listing or stay in your home while you finance the purchase of
              your next one.
            </p>
            <a href="/down-payment-help" className="help-link">
              Explore my offers
            </a>
          </div>
        </div>

        {/* Renting Section */}
        <div
          id="panel-renting"
          role="tabpanel"
          aria-labelledby="tab-renting"
          hidden={activeSection !== "renting"}
          className={`help-container-renting ${
            activeSection === "renting" ? "help-container-active" : ""
          }`}
        >
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Find apartments near you</h3>
              <icons.MdSearch
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>

            <p>
              We'll help you estimate your budget range. Save to your buyer
              profile to help in your search.
            </p>
            <a href="/affordability-calculator" className="help-link">
              Try our affordability calculator
            </a>
          </div>
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Calculate your rent affordability</h3>
              <icons.MdNearMe
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>

            <p>
              See apartments available in your area or a location you choose.
              Narrow your search by price, amenities, and more.
            </p>
            <a href="/mortgage-calculator" className="help-link">
              View apartments near me
            </a>
          </div>
          <div className="help-card">
            <div className="heading-with-icon">
              <h3>Get tips for renting an apartment</h3>
              <icons.MdApartment
                style={{ color: "goldenrod", width: "58px", height: "58px" }}
              />
            </div>
            <p>
              Explore thousands of apartment listings. Find the perfect place to
              call home.
            </p>
            <a href="/down-payment-help" className="help-link">
              Start your apartment search
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
