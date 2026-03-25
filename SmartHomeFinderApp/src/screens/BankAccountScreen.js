import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api";

function BankAccountScreen() {
  const [bankInfo, setBankInfo] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
  });
  const [editCount, setEditCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await api.get("/api/users/bank-account");
        const data = res.data.bankAccount || {};
        setBankInfo({
          accountName: data.accountName || "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
        });
        setEditCount(data.editCount || 0);
        setLocked(Boolean(data.locked));
        setIsEditing(!data.accountName && !data.accountNumber && !data.bankName);
      } catch (err) {
        console.error("Fetch bank account error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBank();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        "/api/users/bank-account",
        { accountName: bankInfo.accountName, bankName: bankInfo.bankName, accountNumber: bankInfo.accountNumber }
      );
      const data = res.data.bankAccount || {};
      setBankInfo({
        accountName: data.accountName || "",
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
      });
      setEditCount(data.editCount || 0);
      setLocked(Boolean(data.locked));
      setIsEditing(false);
      alert(res.data.message || "Bank details saved.");
    } catch (err) {
      console.error("Update bank account error", err);
      const msg = err?.response?.data?.message || "Could not save bank details";
      alert(msg);
    }
  };

  const handleRequestEdit = () => {
    alert("Edit request sent. Our team will review and unlock editing if approved.");
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: 90, paddingBottom: 60 }}>
        <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ marginBottom: 16 }}>Bank Account</h1>
          <p style={{ color: "#555", marginBottom: 20 }}>
            Add or update your payout details. You can edit up to 3 times before requesting another change.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            {loading ? (
              <div>Loading bank details...</div>
            ) : isEditing ? (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>Account name</span>
                  <input
                    type="text"
                    name="accountName"
                    value={bankInfo.accountName}
                    onChange={handleChange}
                    required
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>Bank name</span>
                  <input
                    type="text"
                    name="bankName"
                    value={bankInfo.bankName}
                    onChange={handleChange}
                    required
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>Account number</span>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankInfo.accountNumber}
                    onChange={handleChange}
                    required
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </label>
                <button type="submit" className="profile-option-btn" disabled={locked}>
                  Save bank details
                </button>
                <small>Edits remaining: {Math.max(0, 3 - editCount)}</small>
              </form>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                <div><strong>Account name:</strong> {bankInfo.accountName || "-"}</div>
                <div><strong>Bank:</strong> {bankInfo.bankName || "-"}</div>
                <div><strong>Account number:</strong> {bankInfo.accountNumber || "-"}</div>
                {editCount < 3 && !locked ? (
                  <button className="profile-option-btn" onClick={() => setIsEditing(true)}>
                    Edit bank details
                  </button>
                ) : (
                  <button className="profile-option-btn" onClick={handleRequestEdit}>
                    Request another edit
                  </button>
                )}
                <small>Edits used: {editCount} / 3</small>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default BankAccountScreen;
