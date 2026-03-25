import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (submitting) return;
    if (!password) {
      alert("Please enter a new password");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/auth/reset-password", {
        token,
        password,
      });
      alert("Password reset successful");
    } catch {
      alert("Invalid or expired token");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Navbar />
    <main>
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2>Reset Password</h2>
        <p>Enter a new password to secure your account</p>

        <input
          type="password"
          className="reset-input"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="reset-btn" onClick={handleReset} disabled={submitting}>
          {submitting ? "Resetting..." : "Reset Password"}
        </button>

        <div className="reset-footer">
          Make sure your password is strong and secure
        </div>
      </div>
    </div>
    </main>
    <Footer />
    </>
  );
};


export default ResetPassword;
