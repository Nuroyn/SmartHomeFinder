import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/UserContext";


const SignUpScreen = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [userType, setUserType] = useState("tenant"); // User role (landlord or tenant)

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Handle role selection (tenant or landlord)
  const handleRoleChange = (e) => {
    setUserType(e.target.value);
  };

  // Validation logic
  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.phone) newErrors.phone = "Phone is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords must match";

    return newErrors;
  };

  // Handle form submission
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage(""); // Clear success message on validation error
      return;
    }
    
    // Clear any previous errors and success message before API call
    setErrors({});
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const res = await fetch(
        (process.env.REACT_APP_API_BASE_URL || "http://localhost:5002") + "/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            role: userType,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Handle backend error
        setErrors({ api: data.message || "Sign up failed" });
        return;
      }

      // --- Success Handling ---
      setSuccessMessage("Sign up Successful! Redirecting...");
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      setTimeout(() => {
          login(data.user, data.token);
          navigate("/profile");
      }, 1500); // Navigate after 1.5 seconds

    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ api: "Something went wrong. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "100vh", background: "#f5f5f5" }}>
        <section className="section">
          <div className="container">
            <div className="sign-up-wrapper">
              <div className="sign-up-card">
                <div className="sign-up-header">
                  <h1>Create Account</h1>
                  <p>Fill in the details to sign up</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div
                    role="status"
                    style={{
                      color: "#155724",
                      backgroundColor: "#d4edda",
                      borderColor: "#c3e6cb",
                      marginBottom: "15px",
                      padding: "10px",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                {/* Display API Error if present */}
                {errors.api && (
                  <div
                    className="error-message-api"
                    role="alert"
                    style={{
                      color: "#721c24",
                      backgroundColor: "#f8d7da",
                      borderColor: "#f5c6cb",
                      marginBottom: "15px",
                      padding: "10px",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    <span className="error-text">{errors.api}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="sign-up-form">
                  {/* Full Name */}
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Full Name"
                      className={errors.name ? "error" : ""}
                      disabled={!!successMessage}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <span id="name-error" className="error-text" role="alert">{errors.name}</span>}
                  </div>

                  {/* Email */}
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
                      disabled={!!successMessage}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <span id="email-error" className="error-text" role="alert">{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0803..."
                      className={errors.phone ? "error" : ""}
                      disabled={!!successMessage}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <span id="phone-error" className="error-text" role="alert">{errors.phone}</span>}
                  </div>

                  {/* Password */}
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
                      disabled={!!successMessage}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && <span id="password-error" className="error-text" role="alert">{errors.password}</span>}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={errors.confirmPassword ? "error" : ""}
                      disabled={!!successMessage}
                      aria-describedby={errors.confirmPassword ? "confirmpass-error" : undefined}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && <span id="confirmpass-error" className="error-text" role="alert">{errors.confirmPassword}</span>}
                  </div>

                  {/* Role Selection */}
                  <div className="form-group">
                    <label htmlFor="role-select">Role</label>
                    <select id="role-select" value={userType} onChange={handleRoleChange}>
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-sign-up"
                    disabled={!!successMessage || submitting}
                  >
                    {successMessage ? "Redirecting..." : submitting ? "Signing Up..." : "Sign Up"}
                  </button>
                </form>

                <div className="sign-up-footer">
                  <p>
                    Already have an account?{" "}
                    <Link to="/login" className="login-link">Login here</Link>
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

export default SignUpScreen;
