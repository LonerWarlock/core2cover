"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./ProductCard.css";
import Sample from "../../assets/images/sample.jpg";

const ProductCard = ({ id, title, category, price, images = [], seller }) => {
  const router = useRouter();

  // Fix image path (remove localhost)
  const coverImage = images.length
      ? (images[0].startsWith("http") ? images[0] : `/${images[0]}`)
      : Sample.src || Sample;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <Image src={coverImage} alt={title} className="product-image" width={300} height={300} />
        <span className="product-badge">{category}</span>
      </div>
      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p>Seller: {typeof seller === 'string' ? seller : seller?.name}</p>
        <div className="product-price">₹{price.toLocaleString()}</div>
        <button
          className="product-btn"
          // Pass ID via URL param only
          onClick={() => router.push(`/productinfo?id=${id}`)}
        >
          View Details
        </button>
      </div>
    </article>
  );
};
export default ProductCard;