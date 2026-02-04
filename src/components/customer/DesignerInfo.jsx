"use client";

import api from "../../api/axios";
import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import "./DesignerInfo.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaArrowLeft, FaStar, FaStarHalfAlt, FaRegStar,
  FaTimes, FaExpand, FaCheckCircle, FaMinusCircle, FaMapMarkerAlt
} from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { useSearchParams, useRouter } from "next/navigation";
import { hireDesigner } from "../../api/designer";
import { useSession } from "next-auth/react";
import Image from "next/image";
import MessageBox from "../ui/MessageBox";
import LoadingSpinner from "../ui/LoadingSpinner";

/* ============================================================
    HELPERS
   ============================================================ */
const formatTextWithBreaks = (text, wordLimit = 20) => {
  if (!text) return null;
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  const chunks = [];
  for (let i = 0; i < words.length; i += wordLimit) {
    chunks.push(words.slice(i, i + wordLimit).join(" "));
  }
  return chunks.map((chunk, index) => (
    <React.Fragment key={index}>
      {chunk}
      {index < chunks.length - 1 && <><br /><br /></>}
    </React.Fragment>
  ));
};

const ExpandableText = ({ text = "", limit = 160 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > limit;
  return (
    <div className="bio-container">
      <div className={`expandable-text ${expanded ? "expanded" : ""}`}>
        {expanded || !isLong ? formatTextWithBreaks(text) : `${text.slice(0, limit)}...`}
      </div>
      {isLong && (
        <span className="see-more-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? " See less" : " See more"}
        </span>
      )}
    </div>
  );
};

const renderStars = (avg) => {
  if (avg === null || avg === undefined || isNaN(avg)) return null;
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  const empty = Math.max(0, 5 - full - (half ? 1 : 0));
  return (
    <div className="stars-large">
      {[...Array(full)].map((_, i) => <FaStar key={`f${i}`} className="star filled" />)}
      {half && <FaStarHalfAlt className="star half" />}
      {[...Array(empty)].map((_, i) => <FaRegStar key={`e${i}`} className="star empty" />)}
    </div>
  );
};

/* ============================================================
    1. MAIN CONTENT COMPONENT
   ============================================================ */
const DesignerInfoContent = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const designerId = searchParams.get("id");

  const [designer, setDesigner] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(-1);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const touchStartDist = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  const [hireForm, setHireForm] = useState({
    fullName: "", mobile: "", email: "", location: "",
    budget: "", workType: "", timelineDate: "", description: ""
  });

  // AUTO-COMPLETE USER DETAILS FROM SESSION
  useEffect(() => {
    if (session?.user) {
      setHireForm(prev => ({
        ...prev,
        fullName: session.user.name || prev.fullName,
        email: session.user.email || prev.email,
        mobile: session.user.mobile || session.user.phone || session.user.phoneNumber || prev.mobile
      }));
    }
  }, [session]);

  // GEOLOCATION AUTO-COMPLETE
  const fetchCurrentLocation = (e) => {
    e.preventDefault();
    if (!("geolocation" in navigator)) {
      triggerMsg("Geolocation not supported", "error");
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            const state = data.address.state || "";
            setHireForm(prev => ({
              ...prev,
              location: city && state ? `${city}, ${state}` : city || state || "Detected Location"
            }));
            triggerMsg("Location detected!", "success");
          }
        } catch (error) {
          console.error("Geocode Error:", error);
          triggerMsg("Failed to identify location", "error");
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        setLocLoading(false);
        triggerMsg("Location access denied", "error");
      }
    );
  };

  useEffect(() => {
    const checkTouch = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  useEffect(() => {
    if (!designerId) return;
    const fetchAll = async () => {
      try {
        const [infoRes, ratingsRes] = await Promise.all([
          fetch(`/api/designer/${designerId}/info`),
          fetch(`/api/designer/${designerId}/ratings`)
        ]);
        const info = await infoRes.json();
        const ratingsData = await ratingsRes.json();
        setDesigner(info);
        setRatings(Array.isArray(ratingsData) ? ratingsData : []);
        if (Array.isArray(ratingsData) && ratingsData.length > 0) {
          const sum = ratingsData.reduce((acc, curr) => acc + curr.stars, 0);
          setStats({ average: (sum / ratingsData.length).toFixed(1), total: ratingsData.length });
        }
        if (info.works?.length > 0) {
          setSelectedWorkIndex(0);
          setActiveImage(info.works[0].image);
        } else {
          setSelectedWorkIndex(-1);
          setActiveImage(null);
        }
      } catch (err) {
        console.error("Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [designerId]);

  const triggerMsg = (text, type = "success") => setMsg({ text, type, show: true });
  const handleHireChange = (e) => setHireForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // LIGHTBOX LOGIC
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoomLevel(prev => {
      const nextZoom = Math.min(Math.max(prev + delta, 1), 5);
      if (nextZoom === 1) setPosition({ x: 0, y: 0 });
      return nextZoom;
    });
  }, []);

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    } else if (e.touches.length === 2) {
      touchStartDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - touchStartDist.current) * 0.01;
      setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 5));
      touchStartDist.current = dist;
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (status !== "authenticated") {
      triggerMsg("Please login to hire a designer", "error");
      return;
    }
    try {
      setHireLoading(true);
      await hireDesigner(designerId, { ...hireForm, userEmail: session.user.email, budget: Number(hireForm.budget) });
      triggerMsg("Request sent successfully!", "success");
      setShowForm(false);
    } catch (err) {
      triggerMsg("Failed to send request.", "error");
    } finally {
      setHireLoading(false);
    }
  };

  if (loading || !designer) return <LoadingSpinner message="Opening portfolio..." />;

  return (
    <>
      <div className="designer-info-page">
        {hireLoading && <LoadingSpinner message="Sending request to designer..." />}

        {msg.show && <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />}

        <button className="back-btn" onClick={() => router.back()}><FaArrowLeft /> Back</button>

        <div className={`designer-info-layout ${!designer.works?.length ? 'no-portfolio' : ''}`}>
          <div className="designer-text">
            <div className="profile-header-wrap">
              <Image
                
                src={designer.profile?.profileImage || "https://res.cloudinary.com/dq7vru7sc/image/upload/v1716550732/retina_standard_avatar_v2_f8f8f8.png"}
                width={150}
                height={150}
                className="designer-photo"
                alt="profile"
                style={{ objectFit: "cover" }}
              />
              <div className={`availability-pill ${designer.availability?.toLowerCase() === "available" ? "available" : "unavailable"}`}>
                {designer.availability?.toLowerCase() === "available" ? <FaCheckCircle /> : <FaMinusCircle />}
                {designer.availability || "Unknown"}
              </div>
            </div>
            <h1 className="designer-name">{designer.fullname}</h1>
            <p className="designer-location"><LuMapPin /> {designer.location}</p>
            <div className="designer-rating-summary">{renderStars(stats.average)}<span>({stats.total} Reviews)</span></div>
            <ExpandableText text={designer.profile?.bio} />
            <button className={`hire-btn ${designer.availability?.toLowerCase() !== "available" ? "disabled" : ""}`} onClick={() => designer.availability?.toLowerCase() === "available" && setShowForm(true)}>
              {designer.availability?.toLowerCase() === "available" ? "Hire This Designer" : "Currently Unavailable"}
            </button>
          </div>

          <div className="designer-main-image-container">
            {designer.works?.length > 0 && activeImage ? (
              <div className="designer-main-image" onClick={() => setIsLightboxOpen(true)}>
                <Image
                  src={activeImage}
                  alt="Main"
                  width={800}
                  height={600}
                  priority
                  style={{ objectFit: "cover", cursor: "zoom-in" }}
                />
                <div className="zoom-hint"><FaExpand /> Click to View Fullscreen</div>
              </div>
            ) : (
              <div className="designer-main-image placeholder">
                <div className="placeholder-content">
                  <Image
                    src="/assets/logo/CoreToCover_2_.png"
                    alt="No Work Uploaded"
                    width={150}
                    height={150}
                    style={{ opacity: 0.3, filter: 'grayscale(100%)' }}
                  />
                  <p>No portfolio images uploaded yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfoilo Section - with empty state handler */}
        <section className="portfolio-section">
          <h2>Works Portfolio</h2>
          {designer.works && designer.works.length > 0 ? (
            <div className="portfolio-row">
              {designer.works.map((w, i) => (
                <div
                  key={w.id}
                  className={`portfolio-item ${selectedWorkIndex === i ? 'active' : ''}`}
                  onClick={() => { setActiveImage(w.image); setSelectedWorkIndex(i); }}
                >
                  <Image src={w.image} width={300} height={200} alt="Work" />
                  <p className="work_desc">{w.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-portfolio-message">
              <p>No works or portfolio items have been uploaded by this designer yet.</p>
            </div>
          )}
        </section>

        {/* RESTORED REVIEWS SECTION WITH YOUR CUSTOM CLASSES */}
        <section className="designer-reviews-section">
          <div className="section-header">
            <h2>Designer Feedback</h2>
            <div className="overall-rating-badge">
              <span className="avg-num">{stats.average || "0.0"}</span>
              {renderStars(parseFloat(stats.average))}
              <span className="review-date">({stats.total} Total)</span>
            </div>
          </div>

          <div className="reviews-container">
            {ratings.length > 0 ? (
              ratings.map((rev, index) => (
                <div key={index} className="individual-review-card">
                  <div className="rev-header">
                    <div className="rev-user-meta">
                      <div className="rev-avatar">{rev.reviewerName?.charAt(0) || "U"}</div>
                      <div>
                        <span className="reviewer-name">{rev.reviewerName || "Verified Client"}</span>
                        <span className="review-date">{new Date(rev.createdAt).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                    <div className="stars-large">
                      {"★".repeat(rev.stars)}{"☆".repeat(5 - rev.stars)}
                    </div>
                  </div>
                  <div className="rev-body">
                    <p>“{rev.review}”</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-history" style={{ padding: '20px', gridColumn: '1/-1', textAlign: 'center' }}>
                No feedback received yet for this designer.
              </div>
            )}
          </div>
        </section>

        {isLightboxOpen && (
          <div className="lightbox-overlay" onWheel={handleWheel} onClick={closeLightbox}>
            <button className="lightbox-close" onClick={closeLightbox}><FaTimes /></button>
            <span className="lightbox-controls-aesthetic">
              {isMobile ? "Pinch to Zoom • Swipe to Move" : "Scroll to Zoom • Drag to Move"}
            </span>
            <div
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              <img
                src={activeImage}
                alt="Fullscreen"
                onMouseDown={handleMouseDown}
                draggable="false"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  touchAction: 'none'
                }}
                className="lightbox-img"
              />
            </div>
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>Hire {designer.fullname}</h2><FaTimes onClick={() => setShowForm(false)} style={{ cursor: 'pointer' }} /></div>
              <form className="modal-form" onSubmit={handleHireSubmit}>
                <div className="form-grid">
                  <div>
                    <label>Full Name</label>
                    <input name="fullName" autoComplete="name" value={hireForm.fullName} onChange={handleHireChange} required />
                  </div>
                  <div>
                    <label>Mobile</label>
                    <input name="mobile" type="tel" autoComplete="tel" placeholder="Enter mobile number" value={hireForm.mobile} onChange={handleHireChange} required />
                  </div>
                  <div>
                    <label>Email</label>
                    <input type="email" name="email" autoComplete="email" value={hireForm.email} onChange={handleHireChange} required />
                  </div>

                  <div className="location-field-wrapper">
                    <label>Location</label>
                    <div className="location-input-container">
                      <input
                        name="location"
                        value={hireForm.location}
                        onChange={handleHireChange}
                        placeholder="City, State"
                        required
                      />
                      <button
                        type="button"
                        className={`location-fetch-btn ${locLoading ? 'loading' : ''}`}
                        onClick={fetchCurrentLocation}
                        disabled={locLoading}
                      >
                        {locLoading ? <div className="btn-spinner"></div> : <FaMapMarkerAlt />}
                        <span>{locLoading ? "Detecting..." : "Detect"}</span>
                      </button>
                    </div>
                  </div>

                  <div><label>Budget (₹)</label><input type="number" name="budget" value={hireForm.budget} onChange={handleHireChange} required /></div>
                  <div>
                    <label>Work Type</label>
                    <select name="workType" value={hireForm.workType} onChange={handleHireChange} required>
                      <option value="">Select type</option>
                      <option>Interior Design</option>
                      <option>Product Design</option>
                      <option>Renovation</option>
                      <option>Furniture Design</option>
                    </select>
                  </div>
                </div>
                <div><label>Target Date</label><input type="date" name="timelineDate" value={hireForm.timelineDate} onChange={handleHireChange} required /></div>
                <div className="desc"><label>Description</label><textarea name="description" value={hireForm.description} onChange={handleHireChange} /></div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="submit-btn" disabled={hireLoading}>{hireLoading ? "Sending..." : "Submit"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <style jsx>{`
        .location-input-container {
          display: flex;
          position: relative;
          align-items: center;
          gap: 5px;
        }
        .location-input-container input {
          flex: 1;
        }
        .location-fetch-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0f2f0;
          border: 1px solid #4a5a3f;
          color: #4a5a3f;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
          height: 40px;
          white-space: nowrap;
        }
        .location-fetch-btn:hover {
          background: #4a5a3f;
          color: white;
        }
        .location-fetch-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #ccc;
          border-top: 2px solid #4a5a3f;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

const DesignerInfo = () => (
  <Suspense fallback={<LoadingSpinner message="Preparing designer profile..." />}>
    <Navbar />
    <DesignerInfoContent />
  </Suspense>
);

export default DesignerInfo;