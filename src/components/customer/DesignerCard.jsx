import React, { useEffect, useState } from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
// import Sample from "../../assets/images/sample.jpg";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

/**
 * DesignerCard
 * - fetches rating summary (if not provided via props)
 * - displays average stars + numeric + count
 *
 * Props kept the same as your original component.
 */
const DesignerCard = ({
  id,
  name = "Designer Name",
  category = "General",
  description = "No description provided.",
  price = 0,
  image,
  designer = "Unknown Designer",
  origin = "Unknown Location",
  // optional pre-fetched rating summary (average, count)
  ratingSummary = null,
}) => {
  const navigate = useNavigate();
  const finalImage = image ;
  const [ratings, setRatings] = useState(ratingSummary);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    // if parent provided ratingSummary, skip fetch
    if (ratingSummary) return;

    let cancelled = false;
    const fetchRatings = async () => {
      try {
        setLoadingRatings(true);
        const res = await fetch(`http://localhost:3001/designer/${id}/ratings`);
        if (!res.ok) {
          setRatings(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setRatings(data);
      } catch (err) {
        console.error("Failed to load ratings for designer", id, err);
      } finally {
        if (!cancelled) setLoadingRatings(false);
      }
    };

    fetchRatings();
    return () => {
      cancelled = true;
    };
  }, [id, ratingSummary]);

  // helpers to render star icons (supports half-star)
  const renderStars = (avg) => {
    if (!avg && avg !== 0) return null;
    const full = Math.floor(avg);
    const half = avg - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    const items = [];

    for (let i = 0; i < full; i++) items.push(<FaStar key={`f${i}`} className="star filled" />);
    if (half) items.push(<FaStarHalfAlt key="half" className="star half" />);
    for (let i = 0; i < empty; i++) items.push(<FaRegStar key={`e${i}`} className="star empty" />);

    return items;
  };

  const priceDisplay = price > 0 ? price.toLocaleString() : "Contact for Price";
  const truncatedDescription = description.length > 70 ? description.substring(0, 70) + "..." : description;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img src={finalImage} alt={name} className="product-image" />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">{name}</h3>

        <p className="product-description">{truncatedDescription}</p>

        <div className="product-meta-row">
          <span className="product-meta">Designer: {designer}</span>
          <span className="product-meta">Location: {origin}</span>
        </div>

        {/* Rating summary */}
        <div className="product-rating-row" aria-hidden={loadingRatings}>
          {ratings ? (
            <>
              <div className="stars-inline">{renderStars(ratings.average)}</div>
              <div className="rating-numeric">
                {Number.isFinite(ratings.average) ? ratings.average.toFixed(1) : "--"}{" "}
                <span className="rating-count">({ratings.count})</span>
              </div>
            </>
          ) : (
            <div className="no-rating">No ratings yet</div>
          )}
        </div>

        <button
          className="product-btn"
          onClick={() =>
            navigate("/designer_info", {
              state: {
                designer: {
                  id,
                  name,
                  designer,
                  origin,
                  price,
                  image: finalImage,
                  description,
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

export default DesignerCard;
