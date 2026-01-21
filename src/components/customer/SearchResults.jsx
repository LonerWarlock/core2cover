"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./SearchResults.css";
import "./ProductListing.css"; // Reuse listing styles for sections
import api from "../../api/axios";
import { FaStar, FaGem, FaRegClock, FaLayerGroup, FaArrowLeft } from "react-icons/fa";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchQuery.trim()) {
      queueMicrotask(() => {
        setResults([]);
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    // Relative path used by axios instance
    api.get("/products/search", { params: { q: searchQuery } })
      .then((res) => {
        setResults(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  /* =========================================
      CATEGORIZATION LOGIC (Synced with Listing)
  ========================================= */
  const categorizedData = useMemo(() => {
    return {
      // 1. Top Rated: Rating of 4.5 or higher
      topRated: results.filter(p => Number(p.avgRating) >= 4.5),

      // 2. Premium: Price above ₹15,000
      premium: results.filter(p => Number(p.price) >= 15000),

      // 3. New Arrivals: Recent additions
      newArrivals: [...results].sort((a, b) => b.id - a.id).slice(0, 4),

      // 4. Others: Results not meeting top criteria
      others: results.filter(p =>
        Number(p.avgRating) < 4.5 &&
        Number(p.price) < 15000
      )
    };
  }, [results]);

  const renderSection = (title, icon, list) => {
    if (list.length === 0) return null;
    return (
      <div className="portfolio-section" style={{ marginTop: '50px', textAlign: 'left' }}>
        <h2 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          fontSize: '2rem',
          color: '#606E52',
          fontFamily: '"Playfair Display", serif',
          fontWeight: '500'
        }}>
          {icon} {title}
        </h2>
        <div className="product-grid">
          {list.map((product) => (
            <ProductCard
              key={product.id}
              {...product} // This spreads all fields including unit, conversionFactor, unitsPerTrip
              title={product.name}
              seller={product.sellerName || product.seller}
              origin={product.location || (product.sellerBusiness ? `${product.sellerBusiness.city}, ${product.sellerBusiness.state}` : "Verified")}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      {/* 2. APPLY THE LOADING SPINNER */}
      {loading && <LoadingSpinner message="Searching our collection..." />}

      <div className="products-section"> {/* Using premium container class */}
        <div className="listing-top-nav">
          <button className="back-btn" onClick={() => router.back()}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <h1 className="products-title">Search Results</h1>
        <p className="products-subtitle">
          Showing curated results for: <strong>{searchQuery}</strong>
        </p>

        {loading ? (
          <div style={{ padding: "100px", textAlign: 'center', color: "#6b7280", opacity: 0 }}>
            Searching our collection...
          </div>
        ) : results.length === 0 ? (
          <div className="no-results">No products found matching "{searchQuery}".</div>
        ) : (
          <>
            {/* Displaying categorized search results */}
            {renderSection("Top Rated Matches", <FaStar style={{ color: '#facc15' }} />, categorizedData.topRated)}
            {renderSection("Premium Finds", <FaGem style={{ color: '#91A56E' }} />, categorizedData.premium)}
            {renderSection("Recent Additions", <FaRegClock />, categorizedData.newArrivals)}
            {renderSection("Browse All Results", <FaLayerGroup />, categorizedData.others)}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;