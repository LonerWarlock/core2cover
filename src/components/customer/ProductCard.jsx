"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa"; // Added icons
import "./ProductCard.css";
import Sample from "../../assets/images/sample.jpg";

const ProductCard = ({
  id,
  title,
  category,
  price,
  images = [],
  seller,
  description,
  avgRating,
  ratingCount,
  origin
}) => {
  const router = useRouter();

  const getValidSrc = () => {
    if (images && images.length > 0 && images[0]) {
      const src = images[0];
      if (src.startsWith("http")) return src;
      // Assuming your backend serves images from port 3001
      return `http://localhost:3001${src.startsWith("/") ? "" : "/"}${src}`;
    }
    return Sample;
  };

  const coverImage = getValidSrc();

  return (
    <article className="product-card" onClick={() => router.push(`/productinfo?id=${id}`)}>
      <div className="product-image-container">
        <Image src={coverImage} alt={title} className="product-image" width={300} height={300} unoptimized={true} />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        {/* TITLE & RATING ROW */}
        <div className="product-top-row">
          <h3 className="product-title">{title}</h3>
          <div className="product-rating-badge">
            <FaStar className="star-icon" />
            <span>{avgRating || "0.0"}</span>
            <span className="count">({ratingCount || 0})</span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="product-desc-text">Description: {description}</p>

        {/* SELLER & LOCATION TIGHT GROUP */}
        <div className="product-seller-group">
          <span className="seller-label">By {typeof seller === 'string' ? seller : seller?.name}</span>
          <span className="location-label"><FaMapMarkerAlt /> {origin}</span>
        </div>

        {/* PRICE & BUTTON ROW */}
        <div className="product-footer-row">
          <div className="price-tag">₹{Number(price).toLocaleString('en-IN')}</div>
          <button className="product-view-btn" onClick={() => router.push(`/productinfo?id=${id}`)}>
            View Details
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;