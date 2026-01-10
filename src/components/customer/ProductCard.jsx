import React, { useEffect, useState } from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import Sample from "../../assets/images/sample.jpg";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import api from "../../api/axios";

/* ===============================
   HELPERS
=============================== */
const formatAvailability = (value) => {
  switch (value) {
    case "available":
      return "Available";
    case "out_of_stock":
      return "Out of Stock";
    case "low_stock":
      return "Low Stock";
    case "discontinued":
      return "Discontinued";
    default:
      return "Available";
  }
};

const renderStars = (rating = 0) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push(<FaStar key={i} />);
    else if (i === full + 1 && half)
      stars.push(<FaStarHalfAlt key={i} />);
    else stars.push(<FaRegStar key={i} />);
  }
  return stars;
};

const ProductCard = ({
  id,
  sellerId,
  title,
  category,
  description,
  price,
  images = [],
  seller,
  origin,
  availability = "available",
  video,
}) => {
  const navigate = useNavigate();

  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/product/${id}/ratings`)
      .then((res) => {
        setAvgRating(res.data.avgRating || 0);
        setRatingCount(res.data.count || 0);
      })
      .catch(() => {
        setAvgRating(0);
        setRatingCount(0);
      });
  }, [id]);

  /* IMAGE FIX */
  const coverImage =
    images.length
      ? images[0].startsWith("http")
        ? images[0]
        : `http://localhost:3001/${images[0]}`
      : Sample;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img
          src={coverImage}
          alt={title}
          className="product-image"
        />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">{title}</h3>

        <div className="product-rating">
          {renderStars(avgRating)}
          <span className="rating-text">
            {avgRating ? avgRating.toFixed(1) : "No ratings"}
            {ratingCount > 0 && ` (${ratingCount})`}
          </span>
        </div>


        <div className="product-meta-row">
        <p className="product-description">Description: {description}</p>

          <span className="product-meta">
            Seller: {typeof seller === "string" ? seller : seller?.name || "Not specified"}
          </span>

          <span className="product-meta">
            Location: {origin || (seller?.business
              ? `${seller.business.city}, ${seller.business.state}`
              : "Not specified")}
          </span> 
        </div>

        <div className="product-meta-row">
          Status:{" "}
          <strong>{formatAvailability(availability)}</strong>
        </div>

        <div className="product-price">
          ₹{price.toLocaleString()}
        </div>

        <button
          className="product-btn"
          onClick={() =>
            navigate(`/productinfo?id=${id}`, {
              state: {
                product: {
                  id,
                  sellerId,
                  title,
                  seller,
                  origin,
                  price,
                  images,
                  video,
                  description,
                  availability,
                },
              },
            })
          }
        >
          View Details
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
