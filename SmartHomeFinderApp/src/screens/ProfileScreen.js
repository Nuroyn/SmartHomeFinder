import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Webcam from "react-webcam";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaCamera } from "react-icons/fa";
import AddProperty from "./AddProperty";
import api from "../api/api";
import { useAuth } from "../context/UserContext";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [showCamera, setShowCamera] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const webcamRef = React.useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Capture photo & upload avatar
  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const res = await api.put(
        "/api/users/avatar",
        { avatar: imageSrc }
      );

      const updatedUser = res.data.user;
      const avatarUrl = updatedUser?.avatar_url || updatedUser?.avatar || imageSrc;
      updateUser({ ...updatedUser, avatar_url: avatarUrl, avatar: avatarUrl });

      setShowCamera(false);
      alert("Avatar updated!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Could not update avatar");
    }
  };

  const handleUpdateProfile = () => {
    navigate("/profile/edit");
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteProfile = () => {
    alert("Profile deleted");
  };

  return (
    <>
      <Navbar />
      <main
        style={{
          paddingTop: "80px",
          minHeight: "100vh",
          background: "#f5f5f5",
        }}
      >
        <section className="section">
          <div className="container">
            <div className="profile-wrapper">
              <div className="profile-card">
                <div className="profile-header">
                  <h1>My Profile</h1>
                </div>

                {/* USER INFO */}
                <div className="profile-user-info">
                  <img
                    src={user?.avatar_url || user?.avatar || '/placeholder-avatar.png'}
                    alt="User Avatar"
                    className="profile-avatar"
                  />
                 

                  <button
                    className="btn-change-avatar"
                    onClick={() => setShowCamera(true)}
                    aria-label="Change avatar"
                  >
                    <FaCamera size={20} aria-hidden="true" />
                  </button>

                  <h2 className="profile-name">{user?.full_name}</h2>
                  <p className="profile-email">{user?.email}</p>
                </div>

                {/* CAMERA MODAL */}
                {showCamera && (
                  <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Take avatar photo">
                    <div className="camera-modal-content">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={320}
                        height={240}
                        className="webcam-preview"
                      />

                      <button className="btn-capture" onClick={capturePhoto}>
                        Capture Photo
                      </button>

                      <button
                        className="btn-cancel"
                        onClick={() => setShowCamera(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* MONEY BOX */}
                <div className="profile-actions-row">
                  <div className="profile-action-box">
                  
                    <button
                      className="btn-ask-property"
                      onClick={() => navigate("/moneybox")}
                    >
                      View Moneybox
                    </button>
                  </div>

                  <div className="profile-action-box">
                    
                    <Link to="/property-request">
                      <button className="btn-ask-property">
                        Request Property
                      </button>
                    </Link>
                  </div>
                </div>

                {/* ADD PROPERTY FOR LANDLORD ONLY */}
                {user?.role === "landlord" && (
                  <button className="btn-add-property"
                    onClick={() => navigate("/add-property")}>
                     Add Property
                  </button>

                )}

                {/* OPTIONS */}
                <div className="profile-options">
                  <button className="profile-option-btn" onClick={handleUpdateProfile}>
                    Edit Profile
                  </button>

                  <div className="profile-option">
                    Verification Status:{" "}
                    {user?.verified ? "Verified" : "Not Verified"}
                  </div>

                  <button className="profile-option-btn" onClick={() => navigate("/history")}>Order History</button>
                  <button
                    className="profile-option-btn"
                    onClick={() => navigate("/payment-cards")}
                  >
                    Payment Cards
                  </button>
                  <button
                    className="profile-option-btn"
                    onClick={() => navigate("/bank-account")}
                  >
                    Bank Account
                  </button>
                  <button
                    className="profile-option-btn"
                    onClick={() => navigate("/legal")}
                  >
                    Legal & Policies
                  </button>
                  <button
                    className="profile-option-btn"
                    onClick={() => navigate("/faq")}
                  >
                    FAQs
                  </button>

                  <button
                    onClick={handleDeleteProfile}
                    className="profile-option-btn danger"
                  >
                    Delete Profile
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="profile-option-btn"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showAddProperty && (
          <AddProperty setShowAddProperty={setShowAddProperty} />
        )}
      </main>

      <Footer />
    </>
  );
};

export default ProfileScreen;
