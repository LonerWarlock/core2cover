import React, { useEffect, useState, useMemo } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./MyHiredDesigners.css";
import { LuMapPin } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { getClientHiredDesigners, rateDesigner } from "../../api/designer";

const MyHiredDesigners = () => {
  /* =========================
     STATE
  ========================= */
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRating, setShowRating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [ratingForm, setRatingForm] = useState({
    stars: 5,
    review: "",
  });

  const userId = localStorage.getItem("userId");

  /* =========================
     FETCH HIRED DESIGNERS
  ========================= */
  const fetchHiredDesigners = async () => {
    try {
      setLoading(true);
      setError("");

      if (!userId) {
        setDesigners([]);
        return;
      }

      const res = await getClientHiredDesigners({ userId });

      setDesigners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH HIRED DESIGNERS ERROR:", err);
      setError("Failed to load hired designers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHiredDesigners();
  }, [userId]);

  /* =========================
     SUBMIT DESIGNER RATING
  ========================= */
  const submitRating = async (e) => {
    e.preventDefault();
    if (!selected) return;

    try {
      await rateDesigner(selected.designerId, {
        hireRequestId: selected.id,
        stars: ratingForm.stars,
        review: ratingForm.review,
      });

      alert("Thank you for rating the designer!");

      setShowRating(false);
      setSelected(null);
      setRatingForm({ stars: 5, review: "" });

      fetchHiredDesigners();
    } catch (err) {
      console.error("RATE DESIGNER ERROR:", err);
      alert(err.response?.data?.message || "Failed to submit rating");
    }
  };

  /* =========================
     DESIGNER → CLIENT RATINGS
  ========================= */
  const designerRatings = useMemo(
    () => designers.filter((d) => d.userRating),
    [designers]
  );

  const avgRating = useMemo(() => {
    if (designerRatings.length === 0) return null;

    const total = designerRatings.reduce(
      (sum, d) => sum + d.userRating.stars,
      0
    );

    return (total / designerRatings.length).toFixed(1);
  }, [designerRatings]);

  const renderStars = (count) => (
    <div className="rated-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          className={`star ${i <= count ? "active" : ""}`}
        />
      ))}
    </div>
  );

  /* =========================
     LOGIN GUARD
  ========================= */
  if (!userId) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 60, textAlign: "center" }}>
          <h2>Please login to view your hired designers</h2>
        </div>
        <Footer />
      </>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <Navbar />

      <section className="hired-designers-page">
        {/* HEADER */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">My Hired Designers</h1>
            <p className="page-sub">
              Designers you have hired through CASA
            </p>
          </div>

          {avgRating && (
            <div className="overall-rating-box top-right">
              <h2>Designer Feedback About You</h2>
              <div className="overall-rating">
                <span className="overall-score">{avgRating}</span>
                {renderStars(Math.round(avgRating))}
                <span className="overall-count">
                  ({designerRatings.length} reviews)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* LOADING / ERROR */}
        {loading && <p className="loading-text">Loading...</p>}
        {!loading && error && <p className="form-error">{error}</p>}

        {/* HIRED DESIGNERS */}
        {!loading && designers.length > 0 && (
          <div className="hired-grid">
            {designers.map((d) => (
              <div key={d.id} className="hired-card">
                <img
                  src={
                    d.image ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={d.name}
                  className="hired-image"
                />

                <div className="hired-info">
                  <h3 className="hired-name">{d.name}</h3>
                  <p className="hired-type">{d.category}</p>

                  <p className="hired-location">
                    <LuMapPin /> {d.location}
                  </p>

                  <p className="hired-work">
                    <strong>Work:</strong> {d.workType}
                  </p>

                  <p className="hired-budget">
                    <strong>Budget:</strong> ₹{d.budget}
                  </p>

                  <span className={`hired-status ${d.status}`}>
                    {d.status === "pending" && "Awaiting Response"}
                    {d.status === "accepted" && "In Progress"}
                    {d.status === "completed" && "Completed"}
                    {d.status === "rejected" && "Rejected"}
                  </span>

                  {/* RATE DESIGNER */}
                  {d.status === "completed" && !d.rating && (
                    <button
                      className="rate-btn"
                      onClick={() => {
                        setSelected(d);
                        setShowRating(true);
                      }}
                    >
                      Rate Designer
                    </button>
                  )}

                  {d.rating && (
                    <span className="rated-badge">Rated ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS BY DESIGNERS */}
        {designerRatings.length > 0 && (
          <div className="reviews-section">
            <h2>What Designers Said About You</h2>

            {designerRatings.map((d) => (
              <div key={d.id} className="review-card">
                <div className="review-header">
                  <strong>{d.name}</strong>
                  {renderStars(d.userRating.stars)}
                </div>

                {d.userRating.review && (
                  <p className="review-text">
                    “{d.userRating.review}”
                  </p>
                )}

                <span className="review-author">
                  — {d.userRating.reviewerName}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RATE MODAL */}
      {showRating && selected && (
        <div className="modal-overlay" onClick={() => setShowRating(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Rate {selected.name}</h2>

            <form onSubmit={submitRating}>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`star ${
                      star <= ratingForm.stars ? "active" : ""
                    }`}
                    onClick={() =>
                      setRatingForm({ ...ratingForm, stars: star })
                    }
                  />
                ))}
                <span className="star-text">
                  {ratingForm.stars} / 5
                </span>
              </div>

              <label>
                Review
                <textarea
                  placeholder="Share your experience..."
                  value={ratingForm.review}
                  onChange={(e) =>
                    setRatingForm({
                      ...ratingForm,
                      review: e.target.value,
                    })
                  }
                />
              </label>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowRating(false)}>
                  Cancel
                </button>
                <button type="submit">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyHiredDesigners;
