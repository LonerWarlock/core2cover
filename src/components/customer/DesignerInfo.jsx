// File: src/components/customer/DesignerInfo.jsx
import React, { useEffect, useState } from "react";
import "./DesignerInfo.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaArrowLeft,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaUser,
} from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import { hireDesigner } from "../../api/designer";

/* =========================
   Helpers
======================== */
const ExpandableText = ({ text = "", limit = 160 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > limit;
  return (
    <p className="expandable-text">
      {expanded || !isLong ? text : `${text.slice(0, limit)}...`}
      {isLong && (
        <span
          className="see-more-btn"
          onClick={() => setExpanded((s) => !s)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setExpanded((s) => !s)}
        >
          {expanded ? " See less" : " See more"}
        </span>
      )}
    </p>
  );
};

const renderStars = (avg) => {
  if (avg === null || avg === undefined) return null;
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <>
      {[...Array(full)].map((_, i) => (
        <FaStar key={`f${i}`} className="star filled" />
      ))}
      {half && <FaStarHalfAlt className="star half" />}
      {[...Array(empty)].map((_, i) => (
        <FaRegStar key={`e${i}`} className="star empty" />
      ))}
    </>
  );
};

/* =========================
   Component
======================== */
const DesignerInfo = () => {
  const location = useLocation();
  const designerId = location.state?.designer?.id;

  const [designer, setDesigner] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(-1);

  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(0);
  const REVIEWS_PER_PAGE = 5;

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [hireForm, setHireForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    location: "",
    budget: "",
    workType: "",
    timelineDate: "",
    description: "",
  });

  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [popupImage, setPopupImage] = useState(null);

  useEffect(() => {
    if (!designerId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [infoRes, ratingsRes] = await Promise.all([
          fetch(`http://localhost:3001/designer/${designerId}/info`),
          fetch(`http://localhost:3001/designer/${designerId}/ratings`),
        ]);

        if (!infoRes.ok) throw new Error("Failed to load designer info");

        const info = await infoRes.json();
        const ratings = ratingsRes.ok ? await ratingsRes.json() : null;

        // normalize works array shape if necessary
        const normalizedWorks = (info.works || []).map((w) => {
          // server returns { id, img, title, desc } in prior code — support fallback keys
          return {
            id: w.id,
            img: w.img || w.preview || w.image || w.imageUrl || null,
            title: w.title || (w.description ? w.description.split(".")[0] : "") || "",
            desc: w.desc || w.description || "",
            raw: w,
          };
        });

        const normalizedInfo = {
          ...info,
          works: normalizedWorks,
        };

        setDesigner(normalizedInfo);
        setRatingsSummary(ratings);

        // set first work (if present) as active; otherwise use designer image
        if (normalizedWorks.length > 0) {
          setSelectedWorkIndex(0);
          setActiveImage(normalizedWorks[0].img);
        } else {
          setSelectedWorkIndex(-1);
          setActiveImage(info.image || null);
        }
      } catch (err) {
        console.error("DESIGNER LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [designerId]);

  /* ---------------------------
     Hire form handlers
  --------------------------- */
  const handleHireChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setHireForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setFormError("Please login first");
      return;
    }

    try {
      setHireLoading(true);

      await hireDesigner(designerId, {
        userId,
        fullName: hireForm.fullName,
        email: hireForm.email,
        mobile: hireForm.mobile,
        location: hireForm.location,
        budget: Number(hireForm.budget),
        workType: hireForm.workType,
        timelineDate: hireForm.timelineDate || null,
        description: hireForm.description || null,
      });

      alert("Request sent successfully!");
      setShowForm(false);
      setHireForm({
        fullName: "",
        mobile: "",
        email: "",
        location: "",
        budget: "",
        workType: "",
        timelineDays: "",
        description: "",
      });
    } catch (err) {
      console.error("HIRE ERROR:", err);
      setFormError(err.response?.data?.message || "Failed to send request");
    } finally {
      setHireLoading(false);
    }
  };

  /* ---------------------------
     Work click / image popup
  --------------------------- */
  const handleWorkClick = (index) => {
    if (!designer?.works || index < 0 || index >= designer.works.length) return;
    setSelectedWorkIndex(index);
    setActiveImage(designer.works[index].img);

    const el = document.getElementById("portfolio-preview");
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };
  };

  const openImagePopup = (src) => {
    if (!src) return;
    setPopupImage(src);
    setImagePopupOpen(true);
  };

  const closeImagePopup = () => {
    setImagePopupOpen(false);
    setPopupImage(null);
  };

  /* =========================
   Expandable Work Description
========================= */
  const WorkDescription = ({ text = "", limit = 80 }) => {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;

    const isLong = text.length > limit;

    return (
      <div className="work_desc">
        {expanded || !isLong ? text : `${text.slice(0, limit)}...`}
        {isLong && (
          <span
            className="see-more-btn"
            onClick={(e) => {
              e.stopPropagation(); // 🔥 IMPORTANT: prevent thumbnail click
              setExpanded((s) => !s);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setExpanded((s) => !s)}
          >
            {expanded ? " See less" : " See more"}
          </span>
        )}
      </div>
    );
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 40 }}>Loading designer info...</p>
      </>
    );
  }

  if (!designer) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 40 }}>Designer not found</p>
      </>
    );
  }

  const reviews = ratingsSummary?.reviews || [];
  const avg = ratingsSummary?.average ?? null;
  const pages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));

  const selectedWork = designer.works && designer.works[selectedWorkIndex] ? designer.works[selectedWorkIndex] : null;

  return (
    <>
      <Navbar />

      <div className="designer-info-page">
        <button className="back-btn" onClick={() => window.history.back()}>
          <FaArrowLeft /> Back
        </button>

        <div className="designer-info-layout">
          {/* LEFT */}
          <div className="designer-text">
            <img src={designer.image} alt="designer" className="designer-photo" />

            <div className="title-row">
              <h1 className="designer-name">{designer.name}</h1>

              <div className={`availability-pill ${designer.availability ? "available" : "busy"}`}>
                <span className="dot" />
                {designer.availability ? "Available" : "Busy"}
              </div>
            </div>

            <h3 className="designer-role">{designer.designerType}</h3>

            {designer.portfolio && (
              <a href={designer.portfolio} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                View Portfolio <FaExternalLinkAlt />
              </a>
            )}

            <p className="designer-location">
              <LuMapPin /> {designer.location}
            </p>

            <div className="designer-rating-summary">
              {avg !== null ? (
                <>
                  <div className="stars-large">{renderStars(avg)}</div>
                  <div className="average-number">{Number(avg).toFixed(1)} / 5</div>
                </>
              ) : (
                <div className="no-rating">No ratings yet</div>
              )}
            </div>

            <ExpandableText text={designer.bio} />

            <button
              className={`hire-btn ${!designer.availability ? "disabled" : ""}`}
              onClick={() => setShowForm(true)}
              disabled={!designer.availability}
              aria-disabled={!designer.availability}
            >
              {designer.availability ? "Hire This Designer" : "Currently Unavailable"}
            </button>
          </div>

          {/* RIGHT - MAIN IMAGE */}
          <div className="designer-main-image">
            {activeImage ? (
              <img
                src={activeImage}
                alt={selectedWork?.title || "Work preview"}
                onClick={() => openImagePopup(activeImage)}
                style={{ cursor: "zoom-in", borderRadius: 12 }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", borderRadius: 12 }}>
                <FaUser size={56} />
              </div>
            )}
          </div>
        </div>

        {/* PORTFOLIO / WORKS */}
        <section className="portfolio-section">
          <h2 className="portfolio-title">{designer.name}'s Works</h2>

          {designer.works && designer.works.length > 0 ? (
            <>
              <div className="portfolio-row" role="list" aria-label="Designer works">
                {designer.works.map((w, i) => (
                  <div
                    id={`portfolio-item-${i}`}
                    key={w.id || i}
                    role="listitem"
                    className={`portfolio-item ${selectedWorkIndex === i ? "active" : ""}`}
                    onClick={() => handleWorkClick(i)}
                    onKeyDown={(e) => e.key === "Enter" && handleWorkClick(i)}
                    tabIndex={0}
                  >
                    {/* ✅ SINGLE GROWING CONTAINER */}
                    <div className="work-card">
                      <img src={w.img} alt={w.title || `Work ${i + 1}`} />
                    </div>
                    <div className="portfolio-caption">
                      {w.desc ? <WorkDescription text={w.desc} limit={80} /> : null}
                    </div>
                  </div>

                ))}
              </div>


            </>
          ) : (
            <p className="empty-text">No works uploaded yet.</p>
          )}
        </section>

        {/* REVIEWS */}
        <section className="reviews-section" aria-labelledby="reviews-title" style={{ marginTop: 28 }}>
          <h2 id="reviews-title">Reviews</h2>

          {reviews.length === 0 ? (
            <p className="empty-text">No reviews yet.</p>
          ) : (
            <>
              <ul className="reviews-lists">
                {reviews
                  .slice(reviewsPage * REVIEWS_PER_PAGE, (reviewsPage + 1) * REVIEWS_PER_PAGE)
                  .map((r, idx) => (
                    <li className="review-item" key={`${r.id || idx}-${idx}`}>
                      <div className="review-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div className="reviewer-name">{r.name || r.user || "Reviewer"}</div>
                          <div className="review-stars" style={{ marginTop: 6 }}>{renderStars(r.stars)}</div>
                        </div>
                        <div style={{ color: "var(--text-light)", fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>

                      <p>{r.review || <em>No comment</em>}</p>
                      <div className="review-meta" style={{ marginTop: 6 }}>{/* extra meta if needed */}</div>
                    </li>
                  ))}
              </ul>

              {pages > 1 && (
                <div className="pagination" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
                  <button onClick={() => setReviewsPage((p) => Math.max(0, p - 1))} disabled={reviewsPage === 0}>
                    Prev
                  </button>
                  <span>
                    Page {reviewsPage + 1} of {pages}
                  </span>
                  <button onClick={() => setReviewsPage((p) => Math.min(p + 1, pages - 1))} disabled={reviewsPage === pages - 1}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* HIRE MODAL */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Hire This Designer</h2>

              {formError && <p className="form-error" style={{ color: "red" }}>{formError}</p>}

              <form className="modal-form" onSubmit={handleHireSubmit}>
                <label>
                  Full Name
                  <input name="fullName" value={hireForm.fullName} onChange={handleHireChange} required />
                </label>

                <label>
                  Mobile Number
                  <input name="mobile" value={hireForm.mobile} onChange={handleHireChange} required />
                </label>

                <label>
                  Email
                  <input type="email" name="email" value={hireForm.email} onChange={handleHireChange} required />
                </label>

                <label>
                  City / Location
                  <input name="location" value={hireForm.location} onChange={handleHireChange} required />
                </label>

                <label>
                  Budget in Rs
                  <input type="number" name="budget" value={hireForm.budget} onChange={handleHireChange} required />
                </label>

                <label>
                  Type of Work
                  <select name="workType" value={hireForm.workType} onChange={handleHireChange} required>
                    <option value="">Select type</option>
                    <option>Interior Design</option>
                    <option>Product Design</option>
                    <option>Renovation</option>
                    <option>Furniture Design</option>
                  </select>
                </label>

                <label>
                  Target Completion Date
                  <input
                    type="date"
                    name="timelineDate"
                    value={hireForm.timelineDate}
                    onChange={handleHireChange}
                    required
                  />
                </label>


                <label className="desc">
                  Project Description
                  <textarea name="description" value={hireForm.description} onChange={handleHireChange} />
                </label>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="submit-btn" disabled={hireLoading}>{hireLoading ? "Sending..." : "Send Request"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* IMAGE POPUP */}
        {imagePopupOpen && popupImage && (
          <div className="img-overlay" onClick={closeImagePopup}>
            <div className="img-popup" onClick={(e) => e.stopPropagation()}>
              <img src={popupImage} alt="enlarged" />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default DesignerInfo;
