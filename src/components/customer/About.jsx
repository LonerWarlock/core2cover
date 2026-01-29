"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./About.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";
import CoreToCoverTitle from "../../assets/logo/CoreToCover_1.png";
import Om from "../../assets/founders/om.jpg";
import Soham from "../../assets/founders/soham.jpeg";
import NextImage from "next/image";
import { Github, Linkedin, Instagram, Mail } from "lucide-react";

const founderData = [
  {
    name: "Om Karande",
    role: "Co-Founder",
    image: Om,
    email: "omnileshkarande@gmail.com",
    github: "https://github.com/Om280404",
    linkedin: "https://www.linkedin.com/in/om-karande",
    instagram: "https://www.instagram.com/om_karande_28/"
  },
  // {
  //   name: "Atharv Khot",
  //   role: "Technical Operations",
  //   image: "/atharv.jpg",
  //   email: "atharv@example.com", 
  //   linkedin: "#",
  //   instagram: "#"
  // },
  {
    name: "Soham Phatak",
    role: "Co-Founder",
    image: Soham,
    email: "phataksoham2109@gmail.com",
    github: "https://github.com/LonerWarlock",
    linkedin: "https://www.linkedin.com/in/soham-phatak",
    instagram: "https://www.instagram.com/sohamphatak21/"
  }
];

export default function About() {
  const Brand = ({ children }) => <span className="brand">{children}</span>;
  const BrandTag = ({ children }) => <span className="brand_tag">{children}</span>;
  const Brandbold = ({ children }) => (<span className="brand_bold">{children}</span>);

  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const handleChange = (e) => setIsMobileOrTablet(e.matches);
    setIsMobileOrTablet(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  /**
   * Handles email interaction based on device type.
   * Mobile: Default mailto (opens app)
   * Desktop: Gmail Web (opens browser tab)
   */
  const handleEmailClick = (e, email) => {
    const isMobileDevice = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
      navigator.userAgent
    );

    if (!isMobileDevice) {
      // Logic for Desktop/Laptop: Use Gmail Web
      e.preventDefault();
      const subject = encodeURIComponent("Contacting Core2Cover");
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`;
      window.open(gmailUrl, "_blank");
    }
    // Logic for Mobile: Do nothing, let the <a> tag handle mailto:
  };

  return (
    <section className="about-page">
      {/* HERO SECTION */}
      <header className="about-hero">
        <div className="about-hero-inner">
          <div className="hero-copy">
            {isMobileOrTablet ? (
              <p className="mobile-brand-text">
                <Brandbold>Core2Cover</Brandbold> <br />
                A unified platform where customers can discover curated interior products,
                source high-quality raw materials, and collaborate with skilled freelance
                interior designers — all in one place.
              </p>
            ) : (
              <>
                <h1 className="hero_title">
                  <Brandbold>Core2Cover</Brandbold> — a premium marketplace for home interiors & materials
                </h1>
                <p className="hero-sub">
                  <BrandTag>Core2Cover</BrandTag> is a unified platform where customers can discover
                  curated interior products, source high-quality raw materials, and
                  directly collaborate with skilled freelance interior designers.
                </p>
              </>
            )}
            <div className="hero-ctas">
              <Link href="/" className="btn btn-primary">Explore Marketplace</Link>
              <Link href="/signup" className="btn btn-ghost">Create an account</Link>
              <Link href="/sellersignup" className="btn btn-ghost">Signup as Seller</Link>
              <Link href="/designersignup" className="btn btn-ghost">Signup as Designer</Link>
            </div>
          </div>
        </div>
        {!isMobileOrTablet && (
          <div className="hero-art">
            <NextImage src={CoreToCoverLogo} alt="Logo" width={400} height={400} />
            <BrandTag>From Design To Finish - In One Place.</BrandTag>
          </div>
        )}
      </header>

      <main className="about-main">
        {/* VISION SECTION */}
        <section className="about-story card">
          <div className="card-left">
            <h2>Our vision</h2>
            <p><Brand>Core2Cover</Brand> was built to simplify how people plan and execute home projects. Instead of navigating fragmented offline markets, customers get access to products and materials on one platform.</p>
            <p>Beyond commerce, we enable direct collaboration between customers and verified designers.</p>
          </div>
          <aside className="card-right stats">
            <div className="stat">
              <div className="stat-num">Curated</div>
              <div className="stat-label">Interior Products</div>
            </div>
            <div className="stat">
              <div className="stat-num">Raw</div>
              <div className="stat-label">Materials Marketplace</div>
            </div>
            <div className="stat">
              <div className="stat-num">Freelance</div>
              <div className="stat-label">Designer Hub</div>
            </div>
          </aside>
        </section>

        {/* LEADERSHIP SECTION */}
        <section className="about-founders card">
          <div className="founders-header">
            <h2>Leadership</h2>
            <p className="muted text-center">A focused team building a trust-driven ecosystem for home interiors.</p>
          </div>

          <div className="founders-new-grid">
            {founderData.map((founder, index) => (
              <div key={index} className="founder-card-modern">
                <div className="founder-avatar-container">
                  <NextImage
                    src={founder.image}
                    alt={founder.name}
                    className="founder-img-circle"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="founder-content">
                  <h3 className="founder-name-text">{founder.name}</h3>
                  <p className="founder-role-text">{founder.role}</p>
                  <div className="founder-socials">
                    {founder.email && (
                      <a
                        href={`mailto:${founder.email}?subject=Contacting Core2Cover`}
                        onClick={(e) => handleEmailClick(e, founder.email)}
                        title={`Email ${founder.name}`}
                        className="social-icon"
                      >
                        <Mail size={20} />
                      </a>
                    )}
                    <a href={founder.github} target="_blank" rel="noreferrer" className="social-icon"><Github size={20} /></a>
                    <a href={founder.linkedin} target="_blank" rel="noreferrer" className="social-icon"><Linkedin size={20} /></a>
                    <a href={founder.instagram} target="_blank" rel="noreferrer" className="social-icon"><Instagram size={20} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="about-values card">
          <h2>What we stand for</h2>
          <ul className="values-list">
            <li><strong>Curated quality:</strong> Premium products selected for long-term value.</li>
            <li><strong>Seller empowerment:</strong> Fair tools and clear economics.</li>
            <li><strong>Customer confidence:</strong> Transparent pricing and trusted professionals.</li>
          </ul>
        </section>

        {/* CTA SECTION */}
        <section className="about-cta-section card">
          <h2 className="cta-title">Build your space with <BrandTag>Core2Cover</BrandTag></h2>
          <div className="cta-actions">
            <Link href="/signup" className="cta-button">Get started</Link>
          </div>
          <div className="cta-credits">
            <p className="credits-title">Platform Credits</p>
            <p>Design & Marketing Head — Prathamesh Mali</p>
            <p>CFO — Om Mali</p>
          </div>
        </section>
      </main>
    </section>
  );
}