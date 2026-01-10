import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./SearchResults.css";
import api from "../../api/axios";

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH SEARCH RESULTS
  ========================= */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    api
      .get("/products/search", {
        params: { q: searchQuery },
      })
      .then((res) => {
        setResults(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <>
      <Navbar />

      <div className="results">
        <h2>Search Results</h2>
        <p>
          Showing results for: <strong>{searchQuery}</strong>
        </p>

        <div className="product-grid">
          {loading && (
            <p style={{ gridColumn: "1 / -1" }}>Searching…</p>
          )}

          {!loading && searchQuery.trim() === "" && (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>
              Please enter a search term.
            </p>
          )}

          {!loading && searchQuery.trim() !== "" && results.length === 0 && (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>
              No product found matching your search term.
            </p>
          )}

          {!loading &&
            results.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                sellerId={product.sellerId}
                title={product.name}
                category={product.category}
                price={product.price}
                description={product.description}

                /* ✅ USE DIRECTLY */
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
