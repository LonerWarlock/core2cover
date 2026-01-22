"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt, FaBriefcase, FaShoppingCart } from "react-icons/fa";
import "./ProductCard.css";
import Sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";
import MessageBox from "../ui/MessageBox";

const ProductCard = ({
  id,
  sellerId,
  title,
  category,
  price,
  images = [],
  seller,
  description,
  avgRating,
  ratingCount,
  origin,
  availability = "available",
  // Logistics Props
  unit,
  unitsPerTrip,
  conversionFactor,
  productType,
  shippingChargeType,
  shippingCharge,
  installationAvailable,
  installationCharge
}) => {
  const router = useRouter();
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const getValidSrc = () => {
    if (images && images.length > 0 && images[0]) {
      const src = images[0];
      if (src.startsWith("http")) return src;
      return `/${src}`;
    }
    return Sample;
  };

  const coverImage = getValidSrc();
  const resolvedSellerName = typeof seller === 'string' ? seller : seller?.name || "Verified Seller";

  const handleAddToCart = (e) => {
    e.stopPropagation(); 
    if (availability === "out_of_stock") {
        setMsg({ text: "Sorry, this item is out of stock.", type: "error", show: true });
        return;
    }

    try {
      addToCart({
        materialId: id,
        supplierId: sellerId,
        name: title,
        supplier: resolvedSellerName,
        amountPerTrip: Number(price),
        trips: 1,
        image: images[0] || "",
        unit: unit || "pcs",
        unitsPerTrip: unitsPerTrip || 1,
        conversionFactor: conversionFactor || 1,
        shippingChargeType: shippingChargeType || "Paid",
        shippingCharge: Number(shippingCharge || 0),
        installationAvailable: installationAvailable || "no",
        installationCharge: Number(installationCharge || 0),
      });

      setMsg({
        text: `${title} added to cart successfully!`,
        type: "success",
        show: true
      });
    } catch (error) {
      setMsg({
        text: "Failed to add item to cart.",
        type: "error",
        show: true
      });
    }
  };

  return (
    <>
      {msg.show && (
        <MessageBox
          message={msg.text}
          type={msg.type}
          onClose={() => setMsg({ ...msg, show: false })}
        />
      )}

      <article
        className={`product-card ${availability === 'out_of_stock' ? 'oos-card' : ''}`}
        onClick={() => router.push(`/productinfo?id=${id}`)}
      >
        <div className="product-image-container">
          <Image
            src={coverImage}
            alt={title}
            className="product-image"
            width={340}
            height={340}
            unoptimized={true}
          />
          <span className="product-badge">{category}</span>
          
          {/* Availability Badge */}
          <span className={`stock-badge ${availability}`}>
             {availability.replace('_', ' ')}
          </span>
          
          {availability === 'out_of_stock' && (
             <div className="oos-overlay">SOLD OUT</div>
          )}
        </div>

        <div className="product-info">
          <div className="product-top-row">
            <h3 className="product-title">{title}</h3>
            <div className="product-rating-badge">
              <FaStar className="star-icon" />
              <span className="rating-val">{Number(avgRating || 0).toFixed(1)}</span>
              <span className="rating-count">({ratingCount || 0})</span>
            </div>
          </div>

          <p className="product-desc-text">
            {description ? (description.length > 80 ? description.substring(0, 80) + '...' : description) : "No description provided."}
          </p>

          <div className="product-seller-group">
            <span className="seller-label">
              <FaBriefcase style={{ marginRight: "6px" }} /> By {resolvedSellerName}
            </span>
            <span className="location-label">
              <FaMapMarkerAlt /> {origin || "Location Independent"}
            </span>
          </div>

          <div className="product-footer-row">
            <div className="price-tag">₹{Number(price).toLocaleString('en-IN')}
              <span className="price-unit"> / {unit || 'pcs'}</span>
            </div>
            <button
              className={`product-view-btn ${availability === 'out_of_stock' ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={availability === "out_of_stock"}
            >
              <FaShoppingCart style={{ marginRight: "8px" }} /> 
              {availability === "out_of_stock" ? "Sold Out" : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>
    </>
  );
};

export default ProductCard;