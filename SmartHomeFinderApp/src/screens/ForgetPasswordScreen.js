import { useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!email) {
      alert("Please enter your email");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/auth/forgot-password", {
        email,
      });
      alert("If the email exists, a reset link was sent");
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="forgot-wrapper">
        <div className="forgot-card">
          <h2>Forgot Password</h2>
          <p>Enter your email and we’ll send you a reset link</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="forgot-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="forgot-btn" disabled={submitting}>
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="forgot-footer">
            Check your inbox and spam folder
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPassword;
