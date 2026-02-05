"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "./Navbar";
import DesignerCard from "./DesignerCard";
import Footer from "./Footer";
import "./ProductListing.css";
import { FaArrowLeft, FaMapMarkerAlt, FaTrophy, FaLayerGroup } from "react-icons/fa";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const DesignersContent = () => {
  const [allDesigners, setAllDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("search");

  useEffect(() => {
    const fetchDesigners = async () => {
      setLoading(true);
      try {
        let url = `/api/designers`;
        if (query) url += `?search=${encodeURIComponent(query)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        setAllDesigners(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setAllDesigners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigners();
  }, [query]);

  const categories = useMemo(() => {
    return {
      nearYou: allDesigners.filter(d => d.isLocal),
      topRated: allDesigners.filter(d => d.avgRating >= 4.5).sort((a, b) => b.avgRating - a.avgRating),
      experienced: allDesigners.filter(d => d.experience >= 5),
      others: allDesigners.filter(d => !d.isLocal && d.avgRating < 4.5 && d.experience < 5)
    };
  }, [allDesigners]);

  const renderSection = (title, icon, list) => {
    if (list.length === 0) return null;
    return (
      <div className="portfolio-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           {icon} {title}
        </h2>
        <div className="product-grid">
          {list.map((d) => (
            <DesignerCard key={d.id} {...d} />
          ))}
        </div>
      </div>
    );
  };

  // 2. APPLY THE LOADING SPINNER DURING INITIAL FETCH
  // We keep the container structure so Google sees a "Success" page layout immediately
  if (loading) return (
    <div className="products-section">
      <div className="listing-top-nav">
        <button className="back-btn" onClick={() => router.back()}>
          <FaArrowLeft /> Back
        </button>
      </div>
      <h1 className="products-title">Professional Designers</h1>
      <LoadingSpinner message="Finding professional designers..." />
      {/* Hidden text helps Google understand the page purpose during load */}
      <p style={{ opacity: 0, height: 0 }}>Connecting you with top-tier interior designers and architects.</p>
    </div>
  );

  return (
    <div className="products-section">
      <div className="listing-top-nav">
        <button className="back-btn" onClick={() => router.back()}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <h1 className="products-title">
        {query ? `Search results for "${query}"` : "Professional Designers"}
      </h1>
      <p className="products-subtitle">Connect with top-tier talent tailored to your vision.</p>

      {/* SEO FIX: Show 'No results' ONLY if we are sure there is a search query that failed */}
      {allDesigners.length === 0 ? (
        <div className="no-results-seo-fallback">
          <p className="no-results">No designers found matching your criteria.</p>
          {/* If the bot sees this, we provide a link back to all designers to avoid a Soft 404 */}
          {!query && <button onClick={() => window.location.reload()}>View All Designers</button>}
        </div>
      ) : (
        <>
          {renderSection("Designers Near You", <FaMapMarkerAlt />, categories.nearYou)}
          {renderSection("Top Rated Experts", <FaTrophy />, categories.topRated)}
          {renderSection("Experienced Professionals", <FaLayerGroup />, categories.experienced)}
          {renderSection("Discover More", null, categories.others)}
        </>
      )}
    </div>
  );
};

const Designers = () => (
  <>
    <Navbar />
    {/* 3. APPLY THE LOADING SPINNER TO SUSPENSE FALLBACK */}
    <Suspense fallback={
      <div className="products-section">
        <LoadingSpinner message="Loading Designers..." />
      </div>
    }>
      <DesignersContent />
    </Suspense>
    <Footer />
  </>
);

export default Designers;