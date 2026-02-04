"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import "./DesignerCard.css";

const DesignerCard = ({ id, name, category, image, avgRating, totalRatings, location, experience, bio, isLocal }) => {
  const router = useRouter();

  // Robust Image Validation to prevent "Invalid URL" crash
  const finalImage = (typeof image === "string" && image.includes("cloudinary.com"))
    ? image.replace("/upload/", "/upload/w_400,h_400,c_fill,g_face,q_auto,f_auto/")
    : "https://res.cloudinary.com/dq7vru7sc/image/upload/v1716550732/retina_standard_avatar_v2_f8f8f8.png";

  const truncatedBio = bio
    ? bio.split(" ").slice(0, 6).join(" ") + (bio.split(" ").length > 6 ? "..." : "")
    : "No bio provided.";

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
          unoptimized
          priority={id < 4}
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

        <p className="product-desc-text">{truncatedBio || "No bio provided."}</p>

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