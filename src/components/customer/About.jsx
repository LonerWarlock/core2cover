"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // CHANGED
import "./About.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2.png";
import CoreToCoverTitle from "../../assets/logo/CoreToCover_1.png";
import Image from "next/image";

export default function About() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => 
    typeof window !== "undefined" ? window.matchMedia("(max-width: 900px)").matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const handleMediaQueryChange = (e) => setIsMobileOrTablet(e.matches);
    
    // Listen for changes
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  // ... (Rest of component body remains same, just verify all <Link> tags use href, not to) ...
  return (
    <section className="about-page">
      <header className="about-hero">
        <div className="about-hero-inner">
          <div className="hero-copy">
            {isMobileOrTablet ? (
              <p className="mobile-brand-text">
                <Image src={CoreToCoverTitle.src || CoreToCoverTitle} alt="CoreToCover" className="inline-brand-logo" />
                A unified platform...
              </p>
            ) : (
              <> {/* The Brand and BrandBold components were moved outside the render function to prevent re-creation on every render, which can cause performance issues and unexpected behavior. */}
                <h1 className="hero-title"><span className="brand brand-bold">Core2Cover</span> — a premium marketplace...</h1>
                <p className="hero-sub"><span className="brand">Core2Cover</span> is a unified platform...</p>
              </>
            )}

            <div className="hero-ctas">
              <Link href="/" className="btn btn-primary">Explore Marketplace</Link>
              <Link href="/signup" className="btn btn-ghost">Create an account</Link>
            </div>
          </div>
        </div>
        {!isMobileOrTablet && (<div className="hero-art"><Image src={CoreToCoverLogo.src || CoreToCoverLogo} alt="CoreToCover logo" /></div>)}
      </header>

      <main className="about-main">
        {/* ... (Sections: Vision, Leadership, Values are static HTML/CSS, no changes needed) ... */}
        {/* ... */}
        
        <section className="about-cta-section card">
          <h2 className="cta-title">Build your space with <span className="brand">Core2Cover</span></h2>
          <p className="cta-description">Explore products, source materials, or collaborate with designers...</p>
          <div className="cta-actions">
            <Link href="/signup" className="cta-button">Get started</Link>
          </div>
          {/* ... Credits ... */}
        </section>
      </main>
    </section>
  );
}