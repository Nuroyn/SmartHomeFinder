// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import Logo from "../assets/images/LogoWhiteGold.svg";
import { useAuth } from "../context/UserContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Buy", href: "/#buy" },
    { name: "Sell", href: "/#sell" },
    { name: "Rent", href: "/#rent" },
    { name: "About", href: "/about" },
  ];

  // Detect admin role
  const isAdmin = !!(user && user.role === "admin");
  if (isAdmin) navLinks.push({ name: "Admin", href: "/admin" });

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <a href="/" className="navbar-logo" onClick={closeMenu}>
          <img src={Logo} alt="SmartHome" />
          <span>SmartHome</span>
        </a>

        {/* Desktop Links */}
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a href={link.href} onClick={closeMenu}>
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA: Login + Sign Up (or Logout) */}
        <div className="navbar-cta">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="cta-signup">
              Logout
            </button>
          ) : (
            <>
              {/* Login: Only on Desktop */}
              <a href="/login" className="cta-login desktop-only" onClick={closeMenu}>
                Login
              </a>
              <a href="/signup" className="cta-signup" onClick={closeMenu}>
                Sign Up
              </a>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          type="button"
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${isOpen ? "active" : ""}`}
        aria-hidden={!isOpen}
      >
        {navLinks.map((link) => (
          <a key={link.name} href={link.href} onClick={closeMenu}>
            {link.name}
          </a>
        ))}

        {/* Mobile: Only Sign Up or Logout */}
        {isLoggedIn ? (
          <button onClick={handleLogout} className="cta-signup">
            Logout
          </button>
        ) : (
          <a href="/signup" className="cta-signup" onClick={closeMenu}>
            Sign Up
          </a>
        )}
      </div>
    </>
  );
}