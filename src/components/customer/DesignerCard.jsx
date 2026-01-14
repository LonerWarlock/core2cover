"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "./ProductCard.css";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";

const DesignerCard = ({ id, name, category, image, avgRating, totalRatings, origin, experience, bio }) => {
  const router = useRouter();
  
  // 1. SAFE IMAGE FALLBACK
  // Ensure we never pass null or an empty string to the 'src' prop
  const finalImage = (image && image.length > 0) ? image : "/assets/placeholder-designer.jpg";

  return (
    <article className="product-card" onClick={() => router.push(`/designer_info?id=${id}`)}>
      <div className="product-image-container">
        {/* 2. USE THE VALIDATED SOURCE */}
        <Image 
          src={finalImage} 
          alt={name} 
          className="product-image" 
          width={340} 
          height={340} 
          priority={id < 4}
          unoptimized={!finalImage.startsWith('http')} // Optional: useful if using local assets
        />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        <div className="product-top-row">
          <h3 className="product-title">{name}</h3>
          <div className="product-rating-badge">
            <FaStar className="star-icon" />
            <span className="rating-val">{avgRating || 0}</span>
            <span className="rating-count">({totalRatings || 0})</span>
          </div>
        </div>

        <p className="product-desc-text">{bio || "No bio provided."}</p>

        <div className="product-seller-group">
          <span className="seller-label">
            <FaBriefcase style={{marginRight: '6px'}} /> 
            {experience || 0} Years Experience
          </span>
          <span className="location-label">
            <FaMapMarkerAlt /> {origin || "Location Independent"}
          </span>
        </div>

        <div className="product-footer-row">
          <span className="price-tag">Verified</span>
          <button
            className="product-view-btn"
            onClick={() => router.push(`/designer_info?id=${id}`)}
          >
            View Profile
          </button>
        </div>
      </div>
    </article>
  );
};

export default DesignerCard;