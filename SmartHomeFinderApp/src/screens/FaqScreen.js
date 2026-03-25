import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const faqs = [
  {
    q: "What is SmartHomeFinder?",
    a: "A middleman-free platform connecting verified landlords and tenants. Listings, document checks, inspections, and payments all stay on-platform.",
  },
  {
    q: "How are payments handled?",
    a: "All payments must be completed in-app; no cash or personal-account transfers. Receipts are stored in your account for traceability.",
  },
  {
    q: "Are inspections free?",
    a: "Yes. After you show interest, SmartHomeFinder staff schedules a convenient, free inspection time with the landlord present where possible.",
  },
  {
    q: "What fees apply?",
    a: "Sales: 5% admin fee from both landlord and tenant. Rentals: 5% admin fee from the tenant only. Fees are shown before you pay.",
  },
  {
    q: "Who can list properties?",
    a: "Only verified landlords or direct owners. Agent-posted listings are removed. Proof of ownership and legal documents may be required.",
  },
  {
    q: "How do you verify properties?",
    a: "We review ownership and legal documents before enabling payments. Listings move through submission, admin approval, and publish steps.",
  },
  {
    q: "What if I suspect a fake listing?",
    a: "Report it via the listing page or email support@smarthomefinder.com. We pause the listing, review documents, and may suspend the account.",
  },
  {
    q: "Is my data protected?",
    a: "We follow NDPR principles, use JWT-based auth, and limit sharing to essential providers and your direct counterparty (landlord/tenant).",
  },
  {
    q: "What if a payment fails?",
    a: "Your funds should remain with your bank or payment provider. Retry once, then contact support with your reference ID if it persists.",
  },
  {
    q: "How do I get help?",
    a: "Email support@smarthomefinder.com or submit a request from your profile. For data questions, contact privacy@smarthomefinder.com.",
  },
];

function FaqScreen() {
  return (
    <div style={{ background: "#0c0d10", color: "#f5f7fb", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60 }}>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <p style={{ letterSpacing: 1, textTransform: "uppercase", color: "#8dd3ff", fontSize: 13, marginBottom: 6 }}>
            FAQs
          </p>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "0 0 14px" }}>
            Answers for landlords and tenants.
          </h1>
          <p style={{ color: "#c6d4e4", fontSize: 16, lineHeight: 1.6, maxWidth: 820, marginBottom: 24 }}>
            Get quick answers on payments, inspections, verification, and safety. Still need help? Reach us anytime and we will respond quickly.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {faqs.map((item) => (
              <div key={item.q} style={{ background: "#0f1624", border: "1px solid #1d2838", borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{item.q}</div>
                <div style={{ color: "#c6d4e4", lineHeight: 1.6, fontSize: 14 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "48px auto 0", padding: "0 20px" }}>
          <div style={{ background: "linear-gradient(135deg, #1fa2ff, #12d8fa)", color: "#0c0d10", borderRadius: 14, padding: "22px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>Need more help?</h3>
              <p style={{ margin: 0, color: "#082032" }}>Tell us what you need and we will route it to the right team.</p>
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

export default FaqScreen;
