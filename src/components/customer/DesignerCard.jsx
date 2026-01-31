"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import "./DesignerCard.css";

const DesignerCard = ({ id, name, category, image, avgRating, totalRatings, location, experience, bio, isLocal }) => {
  const router = useRouter();
  
  // Robust Image Validation to prevent "Invalid URL" crash
  const finalImage = (typeof image === "string" && image.startsWith("http")) 
    ? image 
    : "/assets/placeholder-designer.jpg"; 

  return (
    <article 
      className={`product-card ${isLocal ? "local-highlight" : ""}`} 
      onClick={() => router.push(`/designer_info?id=${id}`)}
    >
      <div className="product-image-container">
        <Image 
          src={finalImage} 
          alt={name} 
          className="product-image" 
          fill
          sizes="(max-width: 600px) 140px, 340px"
          priority={id < 4}
          style={{ objectFit: 'cover' }}
        />
        <span className="product-badge">{category}</span>
        {/* {isLocal && <span className="local-badge">Near You</span>} */}
      </div>

      <div className="product-info">
        <div className="product-top-row">
          <h3 className="product-title">{name}</h3>
          <div className="product-rating-badge">
            <FaStar className="star-icon" />
            <span className="rating-val">{avgRating || 0}</span>
          </div>
        </div>

        <p className="product-desc-text">{bio || "No bio provided."}</p>

        <div className="product-seller-group">
          <span className="seller-label">
            <FaBriefcase style={{ marginRight: "6px" }} /> {experience || 0} Yrs Experience
          </span>
          <span className="location-label">
            <FaMapMarkerAlt /> {location || "Remote"}
          </span>
        </div>

        <div className="product-footer-row">
          <span className="price-tag">Verified</span>
          <button className="product-view-btn">View Profile</button>
        </div>
      </div>
    </article>
  );
};

export default DesignerCard;