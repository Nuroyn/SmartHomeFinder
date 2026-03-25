import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    title: "Terms of Service",
    items: [
      "You must be 18 or older, provide accurate information, and use the platform lawfully.",
      "SmartHomeFinder is an intermediary that connects landlords and tenants; third-party agents are not permitted to transact on behalf of others.",
      "Keep your login secure; you are responsible for activity under your account.",
      "Accounts can be suspended for fraud, impersonation, harassment, or other prohibited activities under Nigerian law.",
    ],
  },
  {
    title: "Privacy Policy",
    items: [
      "We may collect name, email, phone, role, property preferences, device/usage data, and inquiry history to operate the service.",
      "Data sharing is limited to essential providers (e.g., Cloudinary) and the counterparties to your transaction (landlord/tenant); we do not sell personal data.",
      "Data is retained only as long as needed for legal, security, and operational purposes and follows NDPR requirements.",
      "You can request access, updates, or deletion of your data where permitted; contact privacy@smarthomefinder.com.",
    ],
  },
  {
    title: "Listing & Verification",
    items: [
      "Only verified landlords or their direct authorized owners may post properties; proof of ownership may be requested.",
      "Listings must include correct location, images, pricing, and legal documents; fraudulent or agent-posted listings can be removed.",
      "SmartHomeFinder reviews ownership and legal documents before enabling transactions to keep deals on-platform and transparent.",
      "Properties pass submission, admin approval, and publish gates before going live to reduce fraud and ensure owner-to-tenant transparency.",
    ],
  },
  {
    title: "Transactions & Payments",
    items: [
      "All payments must be completed on the platform; no cash handoffs or personal account transfers between landlords and tenants.",
      "SmartHomeFinder verifies property legal documents before allowing payment flows; transactions stay on-platform for traceability.",
      "After a tenant shows interest, SmartHomeFinder staff will schedule a free inspection time that works for the tenant.",
      "If satisfied post-inspection, the tenant pays on the platform. Sales: 5% admin fee from both landlord and tenant. Rentals: 5% admin fee from the tenant only.",
    ],
  },
  {
    title: "Content Policy",
    items: [
      "Allowed: genuine property descriptions, photos, videos, and relevant rental/sale information.",
      "Prohibited: fake listings, offensive or illegal content, copyright violations, and content posted by unauthorized agents.",
      "We may remove content or suspend accounts that violate these rules.",
    ],
  },
  {
    title: "Anti-Fraud Policy",
    items: [
      "No intermediary agents: users must deal directly as landlords or tenants; misrepresenting as an owner is forbidden.",
      "Listings may be reviewed before approval; suspicious activity can be suspended and reported to authorities.",
      "We log admin approvals and actions to keep an audit trail for accountability.",
    ],
  },
  {
    title: "Cookie Policy",
    items: [
      "Cookies may be used for session management, analytics, and improving property recommendations.",
      "You can disable cookies via your browser settings; some features may be limited if disabled.",
      "Third-party tools (e.g., analytics) may set their own cookies subject to their policies.",
    ],
  },
  {
    title: "Disclaimer",
    items: [
      "SmartHomeFinder is an intermediary marketplace; transactions and payments must stay on-platform (no cash or personal-account transfers).",
      "We verify property documents before enabling payments, but do not guarantee transaction outcomes; perform your own due diligence.",
      "Listing details come from landlords; confirm during scheduled inspections and rely on in-app receipts for payment proof.",
    ],
  },
  {
    title: "Intellectual Property",
    items: [
      "The platform design, code, brand assets, and content belong to SmartHomeFinder.",
      "Users may not copy, reproduce, or distribute platform assets without permission.",
      "User-generated content remains the user’s responsibility; ensure you have rights to what you upload.",
    ],
  },
  {
    title: "Safety Guidelines",
    items: [
      "Inspections are scheduled free by SmartHomeFinder staff after you show interest; attend only the scheduled time and location.",
      "Do not pay in cash or to personal accounts; complete payments only in the app after inspection and verification.",
      "Bring ID, go with someone you trust, and prefer daytime/well-trafficked visits; share your schedule for safety.",
      "Confirm ownership and documentation shown by staff/landlord before proceeding with any payment.",
    ],
  },
  {
    title: "AI & Recommendations",
    items: [
      "Any AI-powered suggestions are informational only and may not cover every available option.",
      "Verify listings independently before acting on recommendations.",
    ],
  },
  {
    title: "Ratings & Reviews",
    items: [
      "Reviews must be honest, relevant, and non-abusive; no reviews from unauthorized agents.",
      "We may remove reviews that are fraudulent, defamatory, or violate content rules.",
    ],
  },
];

function LegalPoliciesScreen() {
  return (
    <div style={{ background: "#0c0d10", color: "#f5f7fb", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60 }}>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <p style={{ letterSpacing: 1, textTransform: "uppercase", color: "#8dd3ff", fontSize: 13, marginBottom: 6 }}>
            Legal & Policies
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
            <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: 0 }}>
              Clear rules for how we protect you and your listings.
            </h1>
            <span style={{ color: "#8dd3ff", fontSize: 14 }}>
              Last updated: 08 Mar 2026
            </span>
          </div>
          <p style={{ color: "#c6d4e4", fontSize: 16, lineHeight: 1.6, maxWidth: 820, marginBottom: 24 }}>
            SmartHomeFinder removes middlemen and keeps transactions on-platform: we connect landlords and tenants directly, verify
            documents, schedule inspections, and process payments securely. This page outlines our Terms, Privacy (NDPR-aligned),
            Listings, Transactions, Content, Anti-Fraud, Cookies, Disclaimers, IP, Safety, and AI guidance. Consult counsel for final legal text.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {sections.map((section) => (
              <div key={section.title} style={{ background: "#0f1624", border: "1px solid #1d2838", borderRadius: 12, padding: 18 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 18 }}>{section.title}</h3>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#c6d4e4", lineHeight: 1.6 }}>
                  {section.items.map((item) => (
                    <li key={item} style={{ marginBottom: 8 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "48px auto 0", padding: "0 20px" }}>
          <div style={{ background: "linear-gradient(135deg, #1fa2ff, #12d8fa)", color: "#0c0d10", borderRadius: 14, padding: "22px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>Need something specific?</h3>
              <p style={{ margin: 0, color: "#082032" }}>Tell us about your request and we will route it to the right team.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="mailto:support@smarthomefinder.com" style={{ padding: "12px 16px", background: "#0c0d10", color: "#f5f7fb", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
                Email support
              </a>
              <a href="/property-request" style={{ padding: "12px 16px", border: "1px solid #0c0d10", color: "#0c0d10", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
                Request a property
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default LegalPoliciesScreen;
