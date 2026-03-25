import React, { useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const PropertyRequestScreen = () => {
  const [formData, setFormData] = useState({
    propertyType: "",
    message: "",
    requestPropertyLocation: "",
    briefDescription: "",
    state: "",
    lga: "",
    townCity: "",
    purpose: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (submitting) return;
      
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("propertyType", formData.propertyType);
      formDataToSubmit.append("requestPropertyLocation", formData.requestPropertyLocation);
      formDataToSubmit.append("briefDescription", formData.briefDescription);
      formDataToSubmit.append("state", formData.state);
      formDataToSubmit.append("lga", formData.lga);
      formDataToSubmit.append("townCity", formData.townCity);
      formDataToSubmit.append("purpose", formData.purpose);

    setSubmitting(true);
    try {
      const res = await api.post(
        "/api/users/property-request",
        formDataToSubmit
      );

      if (res.status === 201) {
          alert("Your property request has been submitted!");
        
          setFormData({
            propertyType: "",
            requestPropertyLocation: "",
            briefDescription: "",
            state: "",
            lga: "",
            townCity: "",
            purpose: "",
          });


      }
    } catch (err) {
      console.error("Error submitting property request:", err);
      alert("There was an error submitting your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="property-request-form">
        <h2>Request a Property</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Property Type</label>
            <input
              type="text"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Location</label>
            <input
              type="text"
              name="requestPropertyLocation"
              value={formData.requestPropertyLocation}
              onChange={handleInputChange}
              required
            />
             </div>
            <div>
            <label>Purpose (e.g., Rent, Buy)</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label>Brief Description</label>
            <input
              type="text"
              name="briefDescription"
              value={formData.briefDescription}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>LGA</label>
            <input
              type="text"
              name="lga"
              value={formData.lga}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Town/City</label>
            <input
              type="text"
              name="townCity"
              value={formData.townCity}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Click <Link to="/profile" style={{ textDecoration: 'none' }}>here</Link> back to profile </p> 
        </div>
        </div>
        <Footer />
    </>
  );
};

export default PropertyRequestScreen;
