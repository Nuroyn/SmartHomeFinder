import React, { useState, useEffect } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";




const AddProperty = ({ setShowAddProperty = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
    propertyType: "",
    purpose: "",
    yearBuilt: "",
    numBedrooms: 0,
    numBathrooms: 0,
    landSize: "",
    hasGarage: "", // "true" or "false"
    images: [],
    video_url: null,
    propertyDoc: null,
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text: '' }
  const [displayPrice, setDisplayPrice] = useState("");


  const isLand = formData.propertyType === "land";

  useEffect(() => {
  if (formData.propertyType === "land") {
    setFormData((prev) => ({
      ...prev,
      numBedrooms: 0,
      numBathrooms: 0,
      hasGarage: "",
    }));
  }
}, [formData.propertyType]);


  // Universal handler for text/select inputs
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? (value === "" ? "" : Number(value)) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // Price input with comma formatting
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, price: raw }));
    setDisplayPrice(raw ? Number(raw).toLocaleString() : "");
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    
    if (files.length === 0) {
      return;
    }

    // Preview images before upload
    const imageFiles = Array.from(files).map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      imagesPreview: imageFiles, // Store preview URLs temporarily
    }));

    setUploadingImages(true);
    try {
      const uploadedImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);

          const response = await api.post(
            "/api/media/upload",
            fd,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          return response.data.url;
        })
      );

      // Store uploaded images URLs
      setFormData((prev) => ({
        ...prev,
        images: uploadedImages,
      }));

      setMessage({ type: "success", text: "Images uploaded successfully." });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: "error", text: "Error uploading image, please try again." });
      setTimeout(() => setMessage(null), 7000);
    } finally {
      setUploadingImages(false);
    }
  };

// Video upload (send to Cloudinary)
const handleVideoChange = async (e) => {
  const videoFile = e.target.files[0];

  if (videoFile) {
    const formData = new FormData();
    formData.append("file", videoFile);

    setUploadingVideo(true);
    try {
      const response = await api.post(
        "/api/media/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

        // Check if the response contains the secure URL
        if (response.data.url) {
          setFormData((prev) => ({
            ...prev,
            video_url: response.data.url, // Store video URL
          }));
          setMessage({ type: "success", text: "Video uploaded successfully." });
          setTimeout(() => setMessage(null), 5000);
        } else {
          setMessage({ type: "error", text: "Failed to upload video. Please try again." });
          setTimeout(() => setMessage(null), 7000);
        }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage({ type: "error", text: `Error uploading video: ${JSON.stringify(error.response.data)}` });
      } else {
        setMessage({ type: "error", text: "Error uploading video. Please try again." });
      }
      setTimeout(() => setMessage(null), 8000);
    } finally {
      setUploadingVideo(false);
    }
  } else {
    setMessage({ type: "error", text: "Please select a video file." });
    setTimeout(() => setMessage(null), 5000);
  }
};

// Property document upload (send to Cloudinary)
const handleDocChange = async (e) => {
  const docFile = e.target.files[0];

  if (docFile) {
    const formData = new FormData();
    formData.append("file", docFile);

    setUploadingDoc(true);
    try {
      const response = await api.post(
        "/api/media/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check if the response contains the secure URL
      if (response.data.url) {
        setFormData((prev) => ({
          ...prev,
          propertyDoc: response.data.url, // Store document URL
        }));
        setMessage({ type: "success", text: "Document uploaded successfully." });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: "error", text: "Failed to upload document. Please try again." });
        setTimeout(() => setMessage(null), 7000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage({ type: "error", text: `Error uploading document: ${JSON.stringify(error.response.data)}` });
      } else {
        setMessage({ type: "error", text: "Error uploading document. Please try again." });
      }
      setTimeout(() => setMessage(null), 8000);
    } finally {
      setUploadingDoc(false);
    }
  } else {
    setMessage({ type: "error", text: "Please select a document file." });
    setTimeout(() => setMessage(null), 5000);
  }
};

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (uploadingImages || uploadingVideo || uploadingDoc) {
      setMessage({ type: "error", text: "Please wait for uploads to finish." });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      setMessage({ type: "error", text: "Upload at least one image before submitting." });
      setTimeout(() => setMessage(null), 6000);
      return;
    }

    if (!formData.video_url) {
      setMessage({ type: "error", text: "Upload a video tour before submitting." });
      setTimeout(() => setMessage(null), 6000);
      return;
    }

    try {
      const payload = {
        ...formData,
        hasGarage: formData.hasGarage === "true", // convert to boolean
      };

      // Remove house-only fields if land
      if (formData.propertyType === "land") {
        delete payload.numBedrooms;
        delete payload.numBathrooms;
        delete payload.hasGarage;
      }

      setSubmitting(true);
      const response = await api.post(
        "/api/users/properties",
        payload
      );

      if (response.status === 201) {
        setMessage({ type: "success", text: "Property added successfully!" });
        setTimeout(() => {
          setShowAddProperty(false);

          // Reset form data
          setFormData({
            name: "",
            description: "",
            price: "",
            location: "",
            propertyType: "",
            purpose: "",
            yearBuilt: "",
            numBedrooms: 0,
            numBathrooms: 0,
            landSize: "",
            hasGarage: "",
            images: [],
            video_url: null,
            propertyDoc: null,
          });

          // Manually clear file inputs (image, video, document)
          const imgEl = document.getElementById("image-input");
          const vidEl = document.getElementById("video-input");
          const docEl = document.getElementById("doc-input");
          if (imgEl) imgEl.value = "";
          if (vidEl) vidEl.value = "";
          if (docEl) docEl.value = "";
          setMessage(null);
        }, 1200);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error adding property, please try again." });
      setTimeout(() => setMessage(null), 8000);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <>
      <Navbar />
      <div className="add-property-form">
        <h2>Add a New Property</h2>

        {message && (
          <div
            style={{
              color: message.type === "error" ? "#a00" : "#0a0",
              background: message.type === "error" ? "#fee" : "#efe",
              padding: "8px 12px",
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Property Title */}
          <div>
            <label>Property Title</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label>Price</label>
            <input
              type="text"
              name="price"
              value={displayPrice}
              onChange={handlePriceChange}
              placeholder="e.g. 1,500,000"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Property Type */}
          <div>
            <label>Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Type</option>
              <option value="apartment">Apartment</option>
              <option value="blockOfFlat">Block of Flat</option>
              <option value="studio">Studio</option>
              <option value="villa">Villa</option>
              <option value="bungalow">Bungalow</option>
              <option value="land">Land</option>
              <option value="penthouse">Penthouse</option>
              <option value="duplex">Duplex</option>
              <option value="SemiDetachedHouse">Semi-detached House</option>
              <option value="terracedHouse">Terraced House</option>
              <option value="detachedHouse">Detached House</option>
              <option value="mansion">Mansion</option>
              <option value="maisonette">Maisonette</option>
              <option value="traditionalHouse">Traditional House</option>
              <option value="commercialBuilding">Commercial Building</option>
              <option value="industrialProperty">Industrial Property</option>
              <option value="mixedUseBuilding">Mixed-use Building</option>
              <option value="recreationalLand">Recreational Land</option>
              <option value="agriculturalLand">Agricultural Land</option>
              <option value="officeSpace">Office Space</option>
              <option value="retailSpace">Retail Space</option>
              <option value="warehouse">Warehouse</option>

            </select>
          </div>


          {/* Purpose */}
          <div>
            <label>Purpose</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Purpose</option>
              <option value="Rent">Rent</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          {/* Document - Only for Sell */}
          {formData.purpose === "Sell" && (
            <div>
              <label>Property Document (PDF / Image)</label>
              <input
                id="doc-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleDocChange}
                required
              />

              {formData.propertyDoc && (
                <p style={{ color: "green" }}>
                  ✓ Selected: {typeof formData.propertyDoc === 'string' ? formData.propertyDoc.split('/').pop() : formData.propertyDoc.name}
                </p>
              )}
            </div>
          )}

      
          {/* Year Built / Year of Purchase */}
<div>
  <label>{isLand ? "Year of Purchase" : "Year Built"}</label>
  <input
    type="number"
    name="yearBuilt"
    value={formData.yearBuilt}
    onChange={handleInputChange}
    required
  />
</div>


         {/* Bedrooms */}
{!isLand && (
  <div>
    <label>Bedrooms</label>
    <input
      type="number"
      name="numBedrooms"
      value={formData.numBedrooms}
      onChange={handleInputChange}
      required
    />
  </div>
)}
{/* Bathrooms */}
{!isLand && (
  <div>
    <label>Bathrooms</label>
    <input
      type="number"
      name="numBathrooms"
      value={formData.numBathrooms}
      onChange={handleInputChange}
      required
    />
  </div>
)}

          {/* Land Size */}
          <div>
            <label>Land Size (m²)</label>
            <input
              type="number"
              name="landSize"
              value={formData.landSize}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Verify Location */}
          {/* Garage - Boolean */}
{!isLand && (
  <div>
    <label>Garage Available?</label>
    <select
      name="hasGarage"
      value={formData.hasGarage}
      onChange={handleInputChange}
      required
    >
      <option value="">Select Option</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  </div>
)}
          {/* Video Upload */}
          <div>
            <label>Upload Video *</label>
            <input id="video-input" type="file" accept="video/*" onChange={handleVideoChange} required />
            {formData.video_url && (
              <p style={{ color: "green" }}>
                ✓ Uploaded: {formData.video_url.split('/').pop()}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label>Images</label>
            <input
              id="image-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              required
            />

            {((formData.imagesPreview && formData.imagesPreview.length > 0) || (formData.images && formData.images.length > 0)) && (
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {(formData.imagesPreview && formData.imagesPreview.length > 0
                  ? formData.imagesPreview
                  : formData.images
                ).map((img, i) => {
                  const src = typeof img === "string" ? img : URL.createObjectURL(img);
                  return (
                    <img
                      key={i}
                      src={src}
                      alt="preview"
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={uploadingImages || uploadingVideo || uploadingDoc || submitting}
          >
            {submitting
              ? "Submitting..."
              : uploadingImages || uploadingVideo || uploadingDoc
              ? "Uploading..."
              : "Submit Property"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>
            Click{" "}
            <Link to="/profile" style={{ textDecoration: "none" }}>
              here
            </Link>{" "}
            to return to profile
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddProperty;