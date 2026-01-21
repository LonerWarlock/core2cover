"use client";

import React, { useState, useMemo, useEffect } from "react";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./ProductListing.css";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaStar, FaRegClock, FaGem, FaLayerGroup } from "react-icons/fa";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner"; 

const ProductListing = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPageTitle = searchParams.get("page") || "Readymade Products";
  const currentPageDesc = searchParams.get("desc") || "Find the perfect product that enhances your quality of living.";

  const pageProductType = currentPageTitle.toLowerCase().includes("raw")
    ? "material"
    : "finished";

  useEffect(() => {
    fetch(`/api/products?type=${pageProductType}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("FETCH PRODUCTS ERROR:", err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageProductType]);

  const categories = useMemo(() => {
    const uniqueCategories = products
      .map((p) => p.category)
      .filter(Boolean);
    return ["All", ...new Set(uniqueCategories)];
  }, [products]);

  /* =========================================
      NEW CATEGORIZATION LOGIC
  ========================================= */
  const categorizedData = useMemo(() => {
    const baseList = selectedCategory === "All" 
      ? products 
      : products.filter(p => p.category === selectedCategory);

    return {
      // Products with rating >= 4.5
      topRated: baseList.filter(p => Number(p.avgRating) >= 4.5),
      
      // Products priced above ₹15,000 (Luxury/High-end)
      premium: baseList.filter(p => Number(p.price) >= 15000),
      
      // Sorted by ID or date to show latest additions
      newArrivals: [...baseList].sort((a, b) => b.id - a.id).slice(0, 4),
      
      // The rest of the items
      explore: baseList.filter(p => 
        Number(p.avgRating) < 4.5 && 
        Number(p.price) < 15000
      )
    };
  }, [products, selectedCategory]);

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
              {...product}
              title={product.name}
              origin={product.sellerBusiness ? `${product.sellerBusiness.city}, ${product.sellerBusiness.state}` : "Not specified"}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      {/* 2. APPLY THE LOADING SPINNER FOR INITIAL LOAD */}
      {loading && <LoadingSpinner message="Loading Core2Cover collection..." />}

      <section className="products-section">
        <div className="listing-top-nav">
          <button className="back-btn" onClick={() => router.back()}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <h2 className="products-title">{currentPageTitle}</h2>
        <div className="products-subtitle">{currentPageDesc}</div>

        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={cat === selectedCategory ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. CONDITIONAL RENDERING FOR PRODUCTS */}
        {!loading && products.length === 0 ? (
          <div className="no-results">No items found in this category.</div>
        ) : !loading && (
          <>
            {renderSection("New Arrivals", <FaRegClock />, categorizedData.newArrivals)}
            {renderSection("Top Rated Picks", <FaStar style={{color: '#facc15'}}/>, categorizedData.topRated)}
            {renderSection("Premium Collection", <FaGem style={{color: '#91A56E'}}/>, categorizedData.premium)}
            {renderSection("Explore More", <FaLayerGroup />, categorizedData.explore)}
          </>
        )}
      </section>
      <Footer />
    </>
  );
};

export default ProductListing;