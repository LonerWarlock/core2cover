"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./ProductCard.css";
import Sample from "../../assets/images/sample.jpg";

const ProductCard = ({ id, title, category, price, images = [], seller }) => {
  const router = useRouter();

  // 1. STRENGTHENED URL LOGIC
  const getValidSrc = () => {
    if (images && images.length > 0 && images[0]) {
      const src = images[0];
      // If it's a full Cloudinary URL, return it
      if (src.startsWith("http")) return src;
      // If it's a local path but missing the leading slash, add it
      if (src.startsWith("/")) return src;
      return `/${src}`;
    }
    // Fallback to local imported static asset
    return Sample;
  };

  const coverImage = getValidSrc();

  return (
    <article className="product-card">
      <div className="product-image-container">
        <Image 
          src={coverImage} 
          alt={title || "Product Image"} 
          className="product-image" 
          width={300} 
          height={300}
          style={{ objectFit: 'cover' }}
          // Adding unoptimized={true} can help bypass URL construction errors during debugging
        />
        <span className="product-badge">{category}</span>
      </div>
      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p className="product-seller">
          Seller: {typeof seller === 'string' ? seller : seller?.name || "Verified Seller"}
        </p>
        <div className="product-price">₹{Number(price).toLocaleString('en-IN')}</div>
        <button
          className="product-btn"
          onClick={() => router.push(`/productinfo?id=${id}`)}
        >
          View Details
        </button>
      </div>
    </article>
  );
};

export default ProductCard;