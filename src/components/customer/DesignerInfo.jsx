"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import "./DesignerInfo.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaArrowLeft, FaStar, FaStarHalfAlt, FaRegStar,
  FaTimes, FaSearchPlus, FaSearchMinus, FaExpand, FaExternalLinkAlt,
  FaCheckCircle, FaMinusCircle
} from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { useSearchParams, useRouter } from "next/navigation";
import { hireDesigner } from "../../api/designer";
import Image from "next/image";
import MessageBox from "../ui/MessageBox";

/* ============================================================
    HELPERS
   ============================================================ */

/**
 * Injects a line break after every N words to prevent wall-of-text
 */
const formatTextWithBreaks = (text, wordLimit = 20) => {
  if (!text) return null;
  const words = text.split(/\s+/);
  
  // If text is short, return as is
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
        {expanded || !isLong 
          ? formatTextWithBreaks(text) 
          : `${text.slice(0, limit)}...`}
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

  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [hireForm, setHireForm] = useState({
    fullName: "", mobile: "", email: "", location: "",
    budget: "", workType: "", timelineDate: "", description: ""
  });

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
        const ratingsArray = Array.isArray(ratingsData) ? ratingsData : [];
        setRatings(ratingsArray);

        if (ratingsArray.length > 0) {
          const sum = ratingsArray.reduce((acc, curr) => acc + curr.stars, 0);
          setStats({
            average: (sum / ratingsArray.length).toFixed(1),
            total: ratingsArray.length
          });
        }

        if (info.works?.length > 0) {
          setSelectedWorkIndex(0);
          setActiveImage(info.works[0].image);
        } else {
          setActiveImage(info.profile?.profileImage || "/assets/images/sample.jpg");
        }
      } catch (err) {
        console.error("Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [designerId]);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const handleHireChange = (e) => {
    const { name, value } = e.target;
    setHireForm(prev => ({ ...prev, [name]: value }));
  };

  const handleZoom = (direction) => {
    setZoomLevel(prev => direction === 'in' ? Math.min(prev + 0.5, 4) : Math.max(prev - 0.5, 1));
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    if (!userId) {
      triggerMsg("Please login to hire a designer", "error");
      return;
    }

    try {
      setHireLoading(true);
      await hireDesigner(designerId, {
        ...hireForm,
        userId: Number(userId),
        budget: Number(hireForm.budget)
      });

      triggerMsg("Request sent successfully! The designer will contact you soon.", "success");
      setShowForm(false);
      setHireForm({
        fullName: "", mobile: "", email: "", location: "",
        budget: "", workType: "", timelineDate: "", description: ""
      });
    } catch (err) {
      triggerMsg(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setHireLoading(false);
    }
  };

  if (loading || !designer) return <div className="loading-pad">Loading designer profile...</div>;

  const isAvailable = designer.availability?.toLowerCase() === "available";

  return (
    <div className="designer-info-page">
      {msg.show && (
        <MessageBox
          message={msg.text}
          type={msg.type}
          onClose={() => setMsg({ ...msg, show: false })}
        />
      )}

      <button className="back-btn" onClick={() => router.back()}>
        <FaArrowLeft /> Back
      </button>

      <div className="designer-info-layout">
        <div className="designer-text">
          <div className="profile-header-wrap">
            <Image
              src={designer.profile?.profileImage || "/assets/images/sample.jpg"}
              width={150} height={150} className="designer-photo" alt="profile"
            />
            <div className={`availability-pill ${isAvailable ? "available" : "unavailable"}`}>
              {isAvailable ? <FaCheckCircle /> : <FaMinusCircle />}
              {designer.availability || "Unknown"}
            </div>
          </div>

          <h1 className="designer-name">{designer.fullname}</h1>
          <p className="designer-location"><LuMapPin /> {designer.location}</p>

          {designer.profile?.portfolio && (
            <a
              href={designer.profile.portfolio.startsWith('http') ? designer.profile.portfolio : `https://${designer.profile.portfolio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-external-link"
            >
              <FaExternalLinkAlt /> View Detailed Portfolio
            </a>
          )}

          <div className="designer-rating-summary">
            {renderStars(stats.average)}
            <span>({stats.total} Reviews)</span>
          </div>
          
          {/* Bio with 20-word line breaks */}
          <ExpandableText text={designer.profile?.bio} />

          <button
            className={`hire-btn ${!isAvailable ? "disabled" : ""}`}
            onClick={() => isAvailable && setShowForm(true)}
            disabled={!isAvailable}
          >
            {isAvailable ? "Hire This Designer" : "Currently Unavailable"}
          </button>
        </div>

        <div className="designer-main-image" onClick={() => setIsLightboxOpen(true)}>
          <Image src={activeImage} alt="Main" width={800} height={600} priority style={{ objectFit: "cover", cursor: "zoom-in" }} />
          <div className="zoom-hint"><FaExpand /> Click to View Fullscreen</div>
        </div>
      </div>

      <section className="portfolio-section">
        <h2>Works Portfolio</h2>
        <div className="portfolio-row">
          {designer.works?.map((w, i) => (
            <div key={w.id} className={`portfolio-item ${selectedWorkIndex === i ? 'active' : ''}`} onClick={() => { setActiveImage(w.image); setSelectedWorkIndex(i); }}>
              <Image src={w.image} width={300} height={200} alt="Work" />
              <p className="work_desc">{w.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="designer-reviews-section">
        <div className="section-header">
          <h2>Client Feedback</h2>
          {stats.total > 0 && (
            <div className="overall-rating-badge">
              <span className="avg-num">{stats.average}</span>
              <div className="stars-wrap">{renderStars(stats.average)}</div>
            </div>
          )}
        </div>
        <div className="reviews-container">
          {ratings.length > 0 ? (
            ratings.map((rev, index) => {
              const clientName = rev.hireRequest?.user?.name || rev.reviewerName || "Verified Client";

              return (
                <div key={rev.id || index} className="individual-review-card">
                  <div className="rev-header">
                    <div className="rev-user-meta">
                      <div className="rev-avatar">{clientName[0].toUpperCase()}</div>
                      <div className="rev-details">
                        <span className="reviewer-name">{clientName}</span>
                        <span className="review-date">
                          {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                    {renderStars(rev.stars)}
                  </div>
                  {/* Reviews also get the 20-word break formatting */}
                  <div className="rev-text">"{formatTextWithBreaks(rev.review) || "No written comment provided."}"</div>
                </div>
              );
            })
          ) : (
            <p className="no-reviews">No client feedback available yet.</p>
          )}
        </div>  
      </section>

      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}><FaTimes /></button>
          <div className="lightbox-controls">
            <button onClick={(e) => { e.stopPropagation(); handleZoom('in'); }}><FaSearchPlus /></button>
            <button onClick={(e) => { e.stopPropagation(); handleZoom('out'); }}><FaSearchMinus /></button>
          </div>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={activeImage} alt="Fullscreen" style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }} className="lightbox-img" />
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hire {designer.fullname}</h2>
              <FaTimes onClick={() => setShowForm(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form className="modal-form" onSubmit={handleHireSubmit}>
              <div className="form-grid">
                <div><label>Full Name</label><input name="fullName" value={hireForm.fullName} onChange={handleHireChange} required /></div>
                <div><label>Mobile</label><input name="mobile" value={hireForm.mobile} onChange={handleHireChange} required /></div>
                <div><label>Email</label><input type="email" name="email" value={hireForm.email} onChange={handleHireChange} required /></div>
                <div><label>Location</label><input name="location" value={hireForm.location} onChange={handleHireChange} required /></div>
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
  );
};

const DesignerInfo = () => (
  <Suspense fallback={<div>Loading Page...</div>}>
    <Navbar />
    <DesignerInfoContent />
    <Footer />
  </Suspense>
);

export default DesignerInfo;