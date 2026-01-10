"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // CHANGED
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./SearchResults.css";
import api from "../../api/axios";

const SearchResults = () => {
  const searchParams = useSearchParams(); // CHANGED
  const searchQuery = searchParams.get("search") || ""; // CHANGED

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // Defer state updates to avoid synchronous setState in effect
      queueMicrotask(() => {
        setResults([]);
        setLoading(false);
      });
      return;
    }
    queueMicrotask(() => {
 setLoading(true); // Set loading true when a new search query is initiated
    });
    // Relative path used by axios instance
    api.get("/products/search", { params: { q: searchQuery } })
      .then((res) => {
        setResults(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <>
      <Navbar />
      <div className="results">
        <h2>Search Results</h2>
        <p>Showing results for: <strong>{searchQuery}</strong></p>

        <div className="product-grid">
          {loading && <p style={{ gridColumn: "1 / -1" }}>Searching…</p>}
          {!loading && results.length === 0 && (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>No product found.</p>
          )}

          {!loading && results.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                sellerId={product.sellerId}
                title={product.name}
                category={product.category}
                price={product.price}
                description={product.description}
                images={product.images || []}
                image={product.images?.[0] || null}
                seller={product.sellerName}
                origin={product.location}
                availability={product.availability}
                avgRating={product.avgRating || 0}
                ratingCount={product.ratingCount || 0}
              />
            ))}
        </div>
      </div>
      <Footer />
    </>
  );
};
export default SearchResults;