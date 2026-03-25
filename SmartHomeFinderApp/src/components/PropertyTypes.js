import React, { useState, useEffect } from "react";
import api from "../api/api";

const PropertyTypes = () => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [newListings, setNewListings] = useState([]);
  const [newConstructions, setNewConstructions] = useState([]);

  // Fetch property types and other sections from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Property Types
        const propertyTypesResponse = await api.get("/api/property-types");
        setPropertyTypes(propertyTypesResponse.data);

        // Fetch Recommended Properties
        const recommendedResponse = await api.get("/api/recommended-properties");
        setRecommendedProperties(recommendedResponse.data);

        // Fetch New Listings
        const newListingsResponse = await api.get("/api/new-listings");
        setNewListings(newListingsResponse.data);

        // Fetch New Constructions
        const newConstructionsResponse = await api.get("/api/new-constructions");
        setNewConstructions(newConstructionsResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Property Types</h1>

      {/* Recommended for You Section */}
      <section className="recommended-section">
        <h2>Recommended for You</h2>
        <div className="recommended-list">
          {recommendedProperties.map((property) => (
            <div key={property.id} className="recommended-item">
              <img src={property.image} alt={property.name} />
              <h3>{property.name}</h3>
              <p>{property.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Listings Section */}
      <section className="new-listings-section">
        <h2>New Listings</h2>
        <div className="new-listings">
          {newListings.map((property) => (
            <div key={property.id} className="new-listing-item">
              <img src={property.image} alt={property.name} />
              <h3>{property.name}</h3>
              <p>{property.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Constructions Section */}
      <section className="new-constructions-section">
        <h2>New Constructions</h2>
        <div className="new-constructions">
          {newConstructions.map((property) => (
            <div key={property.id} className="new-construction-item">
              <img src={property.image} alt={property.name} />
              <h3>{property.name}</h3>
              <p>{property.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Property Types List */}
      <div className="property-types">
        {propertyTypes.map((type) => (
          <div key={type._id} className="property-type-card">
            <div className="card-header">
              <h3>{type._id}</h3>
              <span className="badge">{type.count}</span>
            </div>
            <p>Number of properties: {type.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyTypes;
