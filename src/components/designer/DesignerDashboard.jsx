import React, { useEffect, useState } from "react";
import "./DesignerDashboard.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPalette,
  FaEdit,
  FaUserTie,
  FaHandshake,
  FaBars,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";
import {
  getDesignerBasic,
  updateDesignerAvailability,
} from "../../api/designer";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

const Brand = ({ children }) => <span className="brand">{children}</span>;

const renderStarsInline = (avg, size = 14) => {
  if (avg == null || Number.isNaN(avg)) {
    return null;
  }
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const items = [];
  for (let i = 0; i < full; i++)
    items.push(<FaStar key={`f${i}`} className="star filled" style={{ fontSize: size }} />);
  if (half) items.push(<FaStarHalfAlt key="half" className="star half" style={{ fontSize: size }} />);
  for (let i = 0; i < empty; i++)
    items.push(<FaRegStar key={`e${i}`} className="star empty" style={{ fontSize: size }} />);
  return items;
};

const DesignerDashboard = () => {
  const navigate = useNavigate();

  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerName, setDesignerName] = useState("Designer");
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // ratings state
  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [ratingsError, setRatingsError] = useState("");

  /* =========================
     LOAD DESIGNER BASIC INFO + RATINGS
  ========================= */
  useEffect(() => {
    const designerId = localStorage.getItem("designerId");
    if (!designerId) return;

    getDesignerBasic(designerId)
      .then((data) => {
        setDesignerName(data.fullname?.trim() || "Designer");
        setAvailable(data.availability === "Available");
      })
      .catch((err) => {
        console.error("Failed to load designer info", err);
      });

    // fetch ratings summary
    const loadRatings = async () => {
      try {
        const res = await fetch(`http://localhost:3001/designer/${designerId}/ratings`);
        if (!res.ok) throw new Error("Failed to load ratings");
        const data = await res.json();
        setRatingsSummary(data);
      } catch (err) {
        console.error("Ratings load error:", err);
        setRatingsError("Failed to load ratings");
      }
    };
    loadRatings();
  }, []);

  /* =========================
     TOGGLE AVAILABILITY (API)
  ========================= */
  const toggleAvailability = async () => {
    const designerId = localStorage.getItem("designerId");
    if (!designerId) return;

    const newStatus = available ? "Unavailable" : "Available";

    try {
      setLoadingAvailability(true);

      await updateDesignerAvailability(designerId, newStatus);

      setAvailable((prev) => !prev);
    } catch (err) {
      console.error("Availability update failed", err);
      alert("Failed to update availability");
    } finally {
      setLoadingAvailability(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/designerdashboard" className="nav-link nav-logo-link">
              <span className="nav-logo-wrap">
                <img
                  src={CoreToCoverLogo}
                  alt="CoreToCover"
                  className="nav-logo"
                />
                <Brand>Core2Cover</Brand>
              </span>
            </Link>
          </div>

          <div className="nav-right">
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li>
                <Link to="/login" className="seller-btn">
                  Login as Customer
                </Link>
              </li>
            </ul>

            <div
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD */}
      <div className="dd-dashboard">
        <div className="dd-header dd-reveal">
          <div className="dd-header-left">
            <h1 className="dd-title">Welcome, {designerName}</h1>
            <p className="dd-sub">
              Manage your portfolio, view client requests and grow your design
              presence.
            </p>
          </div>

          {/* TOP-RIGHT: average rating (added) */}
          <div className="dd-header-right">
            {ratingsSummary ? (
              <div className="dd-top-rating-card" title={`${ratingsSummary.count} reviews`}>
                <div className="dd-top-stars">
                  {renderStarsInline(ratingsSummary.average, 16)}
                </div>
                <div className="dd-top-rating-value">
                  {ratingsSummary.average?.toFixed(1) ?? "—"} <span className="dd-top-out">/ 5</span>
                </div>
                <div className="dd-top-review-count">{ratingsSummary.count} reviews</div>
              </div>
            ) : (
              <div className="dd-top-rating-card empty">
                <div className="dd-top-no-rating">No ratings yet</div>
              </div>
            )}
          </div>
        </div>

        <div className="dd-grid">
          <div
            className="dd-card dd-reveal dd-delay-1"
            onClick={() => navigate("/designerexperience")}
          >
            <div className="dd-icon">
              <FaPalette />
            </div>
            <h3>My Portfolio</h3>
            <p>Upload, edit or manage your best design works.</p>
          </div>

          {/* Work Received */}
          <div
            className="dd-card dd-reveal dd-delay-2"
            onClick={() => navigate("/designerworkreceived")}
          >
            <div className="dd-icon">
              <FaHandshake />
            </div>
            <h3>Work Received</h3>
            <p>See customers who hired you & manage their projects.</p>
          </div>


          <div
            className="dd-card dd-reveal dd-delay-3"
            onClick={() => navigate("/designereditprofile")}
          >
            <div className="dd-icon">
              <FaEdit />
            </div>
            <h3>Edit Profile</h3>
            <p>Update your designer details & portfolio links.</p>
          </div>

          <div className="dd-card dd-reveal dd-delay-4">
            <div className="dd-icon">
              <FaUserTie />
            </div>
            <h3>Designer Settings</h3>
            <p>Set availability.</p>

            <div className="dd-setting-card">
              <div className="dd-setting-info">
                <h3>Availability</h3>
                <p>
                  Show clients whether you are currently accepting projects.
                </p>
              </div>

              <button
                className="dd-toggle-btn"
                onClick={toggleAvailability}
                disabled={loadingAvailability}
              >
                {available ? (
                  <FaToggleOn className="dd-toggle-icon dd-on" />
                ) : (
                  <FaToggleOff className="dd-toggle-icon dd-off" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION (bottom of page) */}
        <div className="dd-reviews-section">
          <h2 className="dd-reviews-title">Client reviews & ratings</h2>

          {ratingsError && <p className="dd-form-error">{ratingsError}</p>}

          {!ratingsSummary || (Array.isArray(ratingsSummary.reviews) && ratingsSummary.reviews.length === 0) ? (
            <p className="dd-empty-text">No reviews yet.</p>
          ) : (
            <div className="dd-reviews-list">
              {ratingsSummary.reviews.map((r, idx) => (
                <div className="dd-review-row" key={idx}>
                  <div className="dd-review-left">
                    <strong className="dd-reviewer-name" data-initial={r.name?.[0] ?? ""}>{r.name}</strong>
                    <div className="dd-review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className="dd-review-right">
                    <div className="dd-review-stars-inline">{renderStarsInline(r.stars, 14)}</div>
                    <div className="dd-review-text">{r.review || <em>No comment</em>}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DesignerDashboard;
