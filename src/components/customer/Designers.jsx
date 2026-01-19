"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "./Navbar";
import DesignerCard from "./DesignerCard";
import Footer from "./Footer";
import "./ProductListing.css";
import { FaArrowLeft, FaMapMarkerAlt, FaTrophy, FaLayerGroup } from "react-icons/fa";

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

  if (loading) return (
    <div className="products-section">
      <p className="no-results">Finding professional designers...</p>
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

      {allDesigners.length === 0 ? (
        <p className="no-results">No designers found matching your criteria.</p>
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
    <Suspense fallback={<div className="products-section"><p className="no-results">Loading Designers...</p></div>}>
      <DesignersContent />
    </Suspense>
    <Footer />
  </>
);

export default Designers;