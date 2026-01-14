"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Added useRouter
import Navbar from "./Navbar";
import DesignerCard from "./DesignerCard";
import Footer from "./Footer";
import "./ProductListing.css";
import { FaArrowLeft } from "react-icons/fa"; // Imported for the icon

const DesignersContent = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const query = searchParams.get("search");

  useEffect(() => {
    const fetchDesigners = async () => {
      setLoading(true);
      try {
        const url = query 
          ? `/api/designers?search=${encodeURIComponent(query)}` 
          : "/api/designers";
        
        const res = await fetch(url);
        const data = await res.json();
        setDesigners(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("FETCH DESIGNERS ERROR:", err);
        setDesigners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigners();
  }, [query]);

  return (
    <section className="products-section">
      {/* Back Button Implementation */}
      <div className="listing-top-nav">
        <button className="back-btn" onClick={() => router.back()}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <h2 className="products-title">
        {query ? `Designer results for "${query}"` : "Professional Designers"}
      </h2>
      
      <div className="product-grid">
        {loading ? (
          <div style={{ padding: "20px", gridColumn: "1 / -1", color: "#8F8B84" }}>
            Finding designers...
          </div>
        ) : designers.length > 0 ? (
          designers.map((d) => (
            <DesignerCard
              key={d.id}
              id={d.id}
              name={d.name}
              image={d.image}
              category={d.category}
              bio={d.bio}
              experience={d.experience}
              origin={d.location}
              avgRating={d.avgRating}
              totalRatings={d.totalRatings}
            />
          ))
        ) : (
          <div style={{ padding: "20px", gridColumn: "1 / -1", color: "#8F8B84" }}>
             <p className="no-results">No designers found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const Designers = () => (
  <>
    <Navbar />
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center" }}>Loading designers...</div>}>
      <DesignersContent />
    </Suspense>
    <Footer />
  </>
);

export default Designers;