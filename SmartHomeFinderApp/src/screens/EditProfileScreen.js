import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api";
import { useAuth } from "../context/UserContext";

function EditProfileScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setForm({ full_name: user?.full_name || "", phone: user?.phone || "" });
  }, [user, navigate]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const res = await api.put(
        "/api/users/profile",
        { full_name: form.full_name, phone: form.phone }
      );

      const updatedUser = res.data.user;
      updateUser(updatedUser);
      setSuccess("Profile updated successfully");
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not update profile";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: 90, paddingBottom: 60 }}>
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px" }}>
          <button
            onClick={() => navigate("/profile")}
            style={{ marginBottom: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            ← Back to Profile
          </button>

          <h1 style={{ marginBottom: 4 }}>Edit Profile</h1>
          <p style={{ marginTop: 0, color: "#6b7280" }}>Update your name or phone number.</p>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, display: "grid", gap: 14 }}>
            {error && (
              <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecdd3", padding: 10, borderRadius: 8 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 10, borderRadius: 8 }}>
                {success}
              </div>
            )}

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Full Name</span>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600, color: "#9ca3af" }}>Email</span>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280" }}
              />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Email cannot be changed</span>
            </label>

            <button
              className="profile-option-btn"
              onClick={handleSave}
              disabled={saving || !form.full_name.trim()}
              style={{ justifyContent: "center", fontWeight: 700 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default EditProfileScreen;
