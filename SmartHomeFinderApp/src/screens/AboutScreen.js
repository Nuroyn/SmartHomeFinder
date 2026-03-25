import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const stats = [
  { label: "Verified landlords", value: "1.2k" },
  { label: "Properties vetted", value: "18k" },
  { label: "Avg. approval time", value: "36 hrs" },
  { label: "Cities covered", value: "42" },
];

const pillars = [
  {
    title: "Trust by design",
    description: "Dual approval + publish gates keep listings genuine and audit ready.",
  },
  {
    title: "Clarity in pricing",
    description: "Upfront fee breakdowns for rent or sale, with escrow-ready flows.",
  },
  {
    title: "Fast handoffs",
    description: "From media uploads to admin review, we keep every step measurable.",
  },
  {
    title: "Local expertise",
    description: "Teams on the ground to verify locations and documents before they go live.",
  },
];

const timeline = [
  { year: "2022", text: "Started as a landlord-first listing tool with manual approvals." },
  { year: "2023", text: "Launched media uploads and Cloudinary delivery for reliable assets." },
  { year: "2024", text: "Added role-based workflows and admin audit trails for every decision." },
  { year: "2025", text: "Introduced escrow-ready payments, dynamic commissions, and transparency." },
];

function AboutScreen() {
  return (
    <div style={{ background: "#0c0d10", color: "#f5f7fb", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60 }}>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32, alignItems: "center" }}>
            <div>
              <p style={{ letterSpacing: 1, textTransform: "uppercase", color: "#8dd3ff", fontSize: 13, marginBottom: 12 }}>
                About SmartHomeFinder
              </p>
              <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 16px" }}>
                Homes you can trust, decisions you can track.
              </h1>
              <p style={{ color: "#c6d4e4", fontSize: 16, lineHeight: 1.6, maxWidth: 620 }}>
                We connect buyers, tenants, and landlords with a workflow that keeps approvals, media, and payments transparent. Every property moves through protection, verification, and publishing gates so you always know what happens next.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <a
                  href="/signup"
                  style={{
                    padding: "12px 18px",
                    background: "linear-gradient(135deg, #1fa2ff, #12d8fa)",
                    color: "#0c0d10",
                    borderRadius: 10,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Get started
                </a>
                <a
                  href="/property-request"
                  style={{
                    padding: "12px 18px",
                    border: "1px solid #2c3a4d",
                    color: "#f5f7fb",
                    borderRadius: 10,
                    textDecoration: "none",
                  }}
                >
                  Request a property
                </a>
              </div>
            </div>
            <div style={{ background: "#111826", border: "1px solid #1d2838", borderRadius: 14, padding: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 16,
                }}
              >
                {stats.map((s) => (
                  <div key={s.label} style={{ padding: "16px 14px", background: "#0f1624", borderRadius: 10 }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ color: "#9eb3c9", fontSize: 14, marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "48px auto", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {pillars.map((item) => (
              <div key={item.title} style={{ background: "#0f1624", border: "1px solid #1d2838", borderRadius: 12, padding: 18 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#c6d4e4", lineHeight: 1.5 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "48px auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 26 }}>How we got here</h2>
            <span style={{ color: "#8dd3ff", fontSize: 14 }}>Built for transparency first</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {timeline.map((item) => (
              <div key={item.year} style={{ background: "#0f1624", border: "1px solid #1d2838", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#8dd3ff", fontWeight: 700, marginBottom: 6 }}>{item.year}</div>
                <div style={{ color: "#c6d4e4", lineHeight: 1.5 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "48px auto", padding: "0 20px" }}>
          <div style={{ background: "linear-gradient(135deg, #1fa2ff, #12d8fa)", color: "#0c0d10", borderRadius: 14, padding: "24px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 22 }}>Ready to list or find your next home?</h3>
              <p style={{ margin: 0, color: "#082032" }}>Create an account, submit a property, or ask our team to source one for you.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/add-property" style={{ padding: "12px 16px", background: "#0c0d10", color: "#f5f7fb", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
                List a property
              </a>
              <a href="/property-request" style={{ padding: "12px 16px", border: "1px solid #0c0d10", color: "#0c0d10", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
                Request sourcing
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AboutScreen;
