import React from "react";
import Navbar from "../customer/Navbar"; // Use your main customer navbar
import Footer from "../customer/Footer";

const LegalLayout = ({ title, lastUpdated, children }) => {
  return (
    <>
      <Navbar />
      <div style={{ 
        maxWidth: "800px", 
        margin: "32px  auto 60px", 
        padding: "0 20px",
        lineHeight: "1.6",
        color: "#333",
        fontFamily: "sans-serif"
      }}>
        <h1 style={{ color: "#4e5a44", marginBottom: "10px" }}>{title}</h1>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "30px" }}>
          Last Updated: {lastUpdated || "January 2026"}
        </p>
        <div className="legal-content">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LegalLayout;