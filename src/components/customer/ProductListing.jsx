"use client";

import React, { useState, useMemo, useEffect } from "react";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./ProductListing.css";
import { useSearchParams, useRouter } from "next/navigation"; // Added useRouter
import { FaArrowLeft } from "react-icons/fa"; // Added for the icon

const ProductListing = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router

  /* =========================================
      PAGE TITLE & DESCRIPTION
  ========================================= */
  const currentPageTitle = searchParams.get("page") || "Readymade Products";
  const currentPageDesc = searchParams.get("desc") || "Find the perfect product that enhances your quality of living.";

  /* =========================================
      DETERMINE PRODUCT TYPE
      finished | material
  ========================================= */
  const pageProductType = currentPageTitle.toLowerCase().includes("raw")
    ? "material"
    : "finished";

  /* =========================================
      FETCH PRODUCTS FROM BACKEND
  ========================================= */
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

  /* =========================================
      CATEGORY LIST
  ========================================= */
  const categories = useMemo(() => {
    const uniqueCategories = products
      .map((p) => p.category)
      .filter(Boolean);
    return ["All", ...new Set(uniqueCategories)];
  }, [products]);

  /* =========================================
      FILTERED PRODUCTS
  ========================================= */
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(
      (p) => p.category === selectedCategory
    );
  }, [products, selectedCategory]);

  return (
    <>
      <Navbar />

      <section className="products-section">
        {/* Added Back Button */}
        <button className="back-btn" onClick={() => router.back()}>
          <FaArrowLeft /> Back
        </button>

        <h2 className="products-title">{currentPageTitle}</h2>
        <p className="products-subtitle">{currentPageDesc}</p>

        {/* Category Filter */}
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

        {/* Product Grid */}
        <div className="product-grid">
          {loading ? (
            <div style={{ padding: "20px", gridColumn: "1 / -1", color: "#6b7280" }}>
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: "20px", gridColumn: "1 / -1", color: "#6b7280" }}>
              No products available.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                sellerId={product.sellerId}
                title={product.name}
                category={product.category}
                description={product.description}
                price={product.price}
                availability={product.availability}
                avgRating={product.avgRating}
                ratingCount={product.ratingCount}
                images={product.images || []}
                video={product.video}
                seller={product.seller}
                origin={
                  product.sellerBusiness
                    ? `${product.sellerBusiness.city}, ${product.sellerBusiness.state}`
                    : "Not specified"
                }
              />
            ))
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ProductListing;