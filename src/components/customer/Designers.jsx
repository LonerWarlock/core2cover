import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import DesignerCard from "./DesignerCard";
import Footer from "./Footer";
import "./ProductListing.css";

const Designers = () => {
  const [designers, setDesigners] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH DESIGNERS (API)
  ========================= */
  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:3001/designers");
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch designers");
          return;
        }

        setDesigners(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Server error while loading designers");
      } finally {
        setLoading(false);
      }
    };

    fetchDesigners();
  }, []);

  /* =========================
     CATEGORY LIST
  ========================= */
  const categories = useMemo(() => {
    const unique = designers
      .map((d) => d.category)
      .filter(Boolean);
    return ["All", ...new Set(unique)];
  }, [designers]);

  /* =========================
     FILTERED DESIGNERS
  ========================= */
  const filteredDesigners = useMemo(() => {
    if (selectedCategory === "All") return designers;
    return designers.filter(
      (d) => d.category === selectedCategory
    );
  }, [designers, selectedCategory]);

  return (
    <>
      <Navbar />

      <section className="products-section">
        <h2 className="products-title">Designers</h2>
        <p className="products-subtitle">
          Customize your living space with the help of our expert interior and
          product designers.
        </p>

        {/* CATEGORY FILTER */}
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

        {/* LOADING */}
        {loading && (
          <div
            style={{
              padding: "20px",
              gridColumn: "1 / -1",
              color: "#6b7280",
            }}
          >
            Loading designers...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              padding: "20px",
              gridColumn: "1 / -1",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {/* DESIGNERS GRID */}
        {!loading && !error && (
          <div className="product-grid">
            {filteredDesigners.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  gridColumn: "1 / -1",
                  color: "#6b7280",
                }}
              >
                No designers found in this category.
              </div>
            ) : (
              filteredDesigners.map((designer) => (
                <DesignerCard
                  key={designer.id}
                  id={designer.id}
                  name={designer.name}
                  image={designer.imageUrl}
                  category={designer.category}
                  description={designer.description}
                  designer={designer.name}
                  origin={designer.designerLocation}
                />
              ))
            )}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
};

export default Designers;
