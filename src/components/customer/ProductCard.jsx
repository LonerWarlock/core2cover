"use client";

import React, { useState } from "react"; // Added useState
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import "./ProductCard.css";
import Sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";
import MessageBox from "../ui/MessageBox"; // Import your MessageBox component

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
  shippingChargeType,
  shippingCharge,
  installationAvailable,
  installationCharge
}) => {
  const router = useRouter();
  
  // MessageBox State
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

  const handleAddToCart = (e) => {
    e.stopPropagation();

    try {
      addToCart({
        materialId: id,
        supplierId: sellerId,
        name: title,
        supplier: typeof seller === 'string' ? seller : seller?.name,
        amountPerTrip: Number(price),
        quantity: 1,
        image: images[0],
        shippingChargeType: shippingChargeType || "free",
        shippingCharge: Number(shippingCharge || 0),
        installationAvailable: installationAvailable || "no",
        installationCharge: Number(installationCharge || 0),
      });

      // Show success message
      setMsg({ 
        text: `${title} added to cart successfully!`, 
        type: "success", 
        show: true 
      });
    } catch (error) {
      // Show error message if cart utility fails
      setMsg({ 
        text: "Failed to add item to cart.", 
        type: "error", 
        show: true 
      });
    }
  };

  return (
    <>
      {/* MessageBox Implementation */}
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}

      <article className="product-card" onClick={() => router.push(`/productinfo?id=${id}`)}>
        <div className="product-image-container">
          <Image src={coverImage} alt={title} className="product-image" width={300} height={300} unoptimized={true} />
          <span className="product-badge">{category}</span>
        </div>

        <div className="product-info">
          <div className="product-top-row">
            <h3 className="product-title">{title}</h3>
            <div className="product-rating-badge">
              <FaStar className="star-icon" />
              <span>{avgRating || "0.0"}</span>
              <span className="count">({ratingCount || 0})</span>
            </div>
          </div>

          <p className="product-desc-text">Description: {description}</p>

          <div className="product-seller-group">
            <span className="seller-label">By {typeof seller === 'string' ? seller : seller?.name}</span>
            <span className="location-label"><FaMapMarkerAlt /> {origin}</span>
          </div>

          <div className="product-footer-row">
            <div className="price-tag">₹{Number(price).toLocaleString('en-IN')}</div>
            <button className="product-view-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    </>
  );
};

export default ProductCard;