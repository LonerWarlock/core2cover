"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react"; 
import "./MyHiredDesigners.css";
import { LuMapPin } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import api from "../../api/axios";
import { rateDesigner } from "../../api/designer";
import Image from "next/image";
import MessageBox from "../ui/MessageBox";
import LoadingSpinner from "../ui/LoadingSpinner";

const MyHiredDesigners = () => {
  const { data: session, status } = useSession();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [ratingForm, setRatingForm] = useState({ stars: 5, review: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  /**
   * EASY DECRYPTION HELPER
   * Decodes Base64 payloads back into readable JSON.
   */
  const decodePayload = (payload) => {
    try {
      const decodedString = atob(payload); // Decodes Base64
      return JSON.parse(decodedString);    // Parses JSON
    } catch (e) {
      console.error("Data decryption failed:", e);
      return null;
    }
  };

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const fetchHiredDesigners = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await api.get("/client/hired-designers");
      
      // Handle the encrypted payload from backend
      if (res.data?.payload) {
        const decodedList = decodePayload(res.data.payload);
        setDesigners(Array.isArray(decodedList) ? decodedList : []);
      } else {
        setDesigners(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Load Error:", err);
      setError("Failed to load hired designers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchHiredDesigners();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const submitRating = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      setIsSubmitting(true);
      await rateDesigner(selected.designerId, {
        hireRequestId: selected.id,
        stars: ratingForm.stars,
        review: ratingForm.review,
      });
      
      triggerMsg("Thank you for rating the designer!", "success");
      setShowRating(false);
      setSelected(null);
      setRatingForm({ stars: 5, review: "" });
      fetchHiredDesigners();
    } catch (err) {
      triggerMsg(err.response?.data?.message || "Failed to submit rating", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const designerRatings = useMemo(() => designers.filter((d) => d.userRating), [designers]);

  const avgRating = useMemo(() => {
    if (designerRatings.length === 0) return null;
    const total = designerRatings.reduce((sum, d) => sum + d.userRating.stars, 0);
    return (total / designerRatings.length).toFixed(1);
  }, [designerRatings]);

  const renderStars = (count) => (
    <div className="rated-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar key={i} className={`star ${i <= count ? "active" : ""}`} />
      ))}
    </div>
  );

  if (status === "loading" || loading) return <LoadingSpinner message="Retrieving hired experts..." />;
  
  if (status === "unauthenticated") return <div style={{ padding: 60, textAlign: "center" }}><h2>Please login to view your designers</h2></div>;

  return (
    <section className="hired-designers-page">
      {isSubmitting && <LoadingSpinner message="Submitting your feedback..." />}

      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Hired Designers</h1>
          <p className="page-sub">Designers you have hired through Core2Cover</p>
        </div>
        {avgRating && (
          <div className="overall-rating-box top-right">
            <h2>Feedback from Designers</h2>
            <div className="overall-rating">
              <span className="overall-score">{avgRating}</span>
              {renderStars(Math.round(Number(avgRating)))}
              <span className="overall-count">({designerRatings.length} reviews)</span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="hired-grid">
        {designers.length === 0 ? (
          <p className="empty-state">No designers hired yet.</p>
        ) : (
          designers.map((d) => (
            <div key={d.id} className="hired-card">
              <div className="image-container" style={{ position: 'relative', width: '80px', height: '80px' }}>
                <Image
                  src={d.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt={d.name}
                  fill
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                  unoptimized
                />
              </div>
              <div className="hired-info">
                <h3 className="hired-name">{d.name}</h3>
                <p className="hired-type">{d.category}</p>
                <p className="hired-location"><LuMapPin /> {d.location}</p>
                <p className="hired-work"><strong>Work:</strong> {d.workType}</p>
                <p className="hired-budget"><strong>Budget:</strong> ₹{d.budget}</p>
                <span className={`hired-status ${d.status}`}>
                  {d.status.toUpperCase()}
                </span>
                
                {d.status === "completed" && !d.rating && (
                  <button className="rate-btn" onClick={() => { setSelected(d); setShowRating(true); }}>Rate Designer</button>
                )}
                {d.rating && <span className="rated-badge">Rated ✓</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {designerRatings.length > 0 && (
        <div className="reviews-section">
          <h2>What Designers Said About You</h2>
          {designerRatings.map((d) => (
            <div key={d.id} className="review-card">
              <div className="review-header"><strong>{d.name}</strong>{renderStars(d.userRating.stars)}</div>
              {d.userRating.review && <p className="review-text">“{d.userRating.review}”</p>}
              <span className="review-author">— {d.userRating.reviewerName || "Designer"}</span>
            </div>
          ))}
        </div>
      )}

      {showRating && selected && (
        <div className="modal-overlay" onClick={() => setShowRating(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Rate {selected.name}</h2>
            <form onSubmit={submitRating}>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className={`star ${star <= ratingForm.stars ? "active" : ""}`} onClick={() => setRatingForm({ ...ratingForm, stars: star })} />
                ))}
              </div>
              <label>Review <textarea value={ratingForm.review} onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })} /></label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowRating(false)}>Cancel</button>
                <button type="submit">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyHiredDesigners;