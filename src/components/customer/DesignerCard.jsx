"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "./ProductCard.css";
import Image from "next/image";

const DesignerCard = ({ id, name, category, image }) => {
  const router = useRouter();
  const finalImage = image ? (image.startsWith("http") ? image : `/${image}`) : null;

  return (
    <article className="product-card">
      <div className="product-image-container">
        {finalImage && (<Image 
    src={finalImage} 
    alt={name} 
    className="product-image" 
    width={300} 
    height={300} 
    style={{ objectFit: 'cover' }} 
  />)}
        <span className="product-badge">{category}</span>
      </div>
      <div className="product-info">
        <h3>{name}</h3>
        <button
          className="product-btn"
          onClick={() => router.push(`/designer_info?id=${id}`)}
        >
          View Details
        </button>
      </div>
    </article>
  );
};
export default DesignerCard;