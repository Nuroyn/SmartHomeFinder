import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/UserContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (submitting) return;

  // Run your validation first
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setSubmitting(true);
  // Real backend login
  api.post("/api/auth/login", formData)
    .then((response) => {
      login(response.data.user, response.data.token);
      navigate("/profile");
    })
    .catch((err) => {
      console.log(err);
      alert("Invalid login details");
    })
    .finally(() => {
      setSubmitting(false);
    });
};


  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "100vh", background: "#f5f5f5" }}>
        <section className="section">
          <div className="container">
            <div className="login-wrapper">
              <div className="login-card">
                <div className="login-header">
                  <h1>Welcome Back</h1>
                  <p>Sign in to access your profile</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={errors.email ? "error" : ""}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <span id="email-error" className="error-text" role="alert">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={errors.password ? "error" : ""}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && <span id="password-error" className="error-text" role="alert">{errors.password}</span>}
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Remember me</span>
                    </label>
                    <a href="forgetpassword" className="forgot-link">Forgot password?</a>
                  </div>

                  <button type="submit" className="btn-login" disabled={submitting}>
                    {submitting ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                <div className="login-footer">
                  <p>
                    Don't have an account?{" "}
                    <a href="signup" className="signup-link">Sign up</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default LoginScreen;