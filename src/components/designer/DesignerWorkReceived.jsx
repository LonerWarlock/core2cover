"use client";

import React, { useState, useEffect } from "react";
import "./DesignerWorkReceived.css";
import "./DesignerDashboard.css";
import Link from "next/link";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaStar,
  FaArrowLeft,
} from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import {
  getDesignerWorkRequests,
  rateUser,
} from "../../api/designer";
import api from "../../api/axios";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";
import MessageBox from "../ui/MessageBox";
import { useRouter } from "next/navigation";


const BrandBold = () => (
  <span className="brand brand-bold">Core2Cover</span>
);

const DesignerWorkReceived = () => {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Notification State
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  // Rate client modal
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState(null);
  const [tempStars, setTempStars] = useState(5);
  const [tempReview, setTempReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Client Reputation Modal
  const [clientRatingsModalOpen, setClientRatingsModalOpen] = useState(false);
  const [clientRatings, setClientRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  const [designerId, setDesignerId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("designerId");
      setDesignerId(id);
    }
  }, []);

  useEffect(() => {
    if (!designerId) {
      if (designerId === null) return;
      setLoading(false);
      return;
    }
    fetchData();
  }, [designerId]);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getDesignerWorkRequests(designerId);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed fetch work requests", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId, newStatus) => {
    try {
      await api.patch(`/designer/work-request/${jobId}/status`, { status: newStatus });

      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );

      triggerMsg(`Project successfully marked as ${newStatus}`, "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update status";
      triggerMsg(errorMsg, "error");
    }
  };

  const openRateModal = (job) => {
    setRateTarget(job);
    setTempStars((job.userRating && job.userRating.stars) || 5);
    setTempReview((job.userRating && job.userRating.review) || "");
    setRateModalOpen(true);
  };

  const closeRateModal = () => {
    setRateModalOpen(false);
    setRateTarget(null);
  };

  const openClientRatings = async (userId) => {
    if (!userId) return triggerMsg("Client ID not available", "error");
    try {
      setRatingsLoading(true);
      const res = await api.get(`/client/${userId}/ratings`);
      setClientRatings(Array.isArray(res.data) ? res.data : []);
      setClientRatingsModalOpen(true);
    } catch (err) {
      triggerMsg("Failed to load client reviews", "error");
    } finally {
      setRatingsLoading(false);
    }
  };

  const closeClientRatings = () => {
    setClientRatingsModalOpen(false);
    setClientRatings([]);
  };

  const submitUserRating = async (e) => {
    e.preventDefault();
    if (!rateTarget || !designerId) {
      triggerMsg("Missing designer or job information. Please refresh.", "error");
      return;
    }

    try {
      setSubmitting(true);
      await rateUser(designerId, {
        hireRequestId: rateTarget.id,
        stars: tempStars,
        review: tempReview,
      });

      triggerMsg("Client rated successfully!", "success");
      await fetchData();
      closeRateModal();
      setTempStars(5);
      setTempReview("");

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to rate client";
      triggerMsg(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            {/* LOGO WRAPPER - Updated for Drag & Drop support */}
            <Link 
              href="/" 
              className="nav-logo-link" 
              draggable="true"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="nav-logo-wrap">
                <Image src={CoreToCoverLogo} alt="Logo" width={120} height={50} style={{ height: "auto", width: "50px" }} />
                <BrandBold />
              </span>
            </Link>
          </div>
          <div className="nav-right">
            <div className="hamburger always-visible" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li><Link href="/login" className="seller-btn">Login as Customer</Link></li>
            </ul>
          </div>
        </div>
      </header>

      <div className="c2c-dwrx-page">

        <div className="de-navigation-top de-reveal">
          <button className="de-back-btn" onClick={() => router.push("/designerdashboard")}>
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        <div className="c2c-dwrx-header c2c-anim-reveal">
          <h1 className="c2c-dwrx-title">Work Requests</h1>
          <p className="c2c-dwrx-sub">Premium client leads curated exclusively for you.</p>
        </div>


        <div className="c2c-dwrx-job-list">
          {loading && <p style={{ padding: 20 }}>Loading work requests...</p>}
          {!loading && jobs.length === 0 && <p style={{ padding: 20 }}>No work requests yet.</p>}

          {jobs.map((job) => (
            <div key={job.id} className="c2c-dwrx-job-card c2c-anim-reveal">
              <div className="c2c-dwrx-card-left">
                <h2 className="c2c-dwrx-client-name">
                  <FaUser /> {job.clientName}
                </h2>

                <div className="c2c-dwrx-details-grid">
                  <div className="c2c-dwrx-field">
                    <label>Project Type</label>
                    <p>{job.workType || job.type}</p>
                  </div>
                  <div className="c2c-dwrx-field">
                    <label>Budget</label>
                    <p><FaRupeeSign /> {job.budget}</p>
                  </div>
                  <div className="c2c-dwrx-field">
                    <label>Location</label>
                    <p><LuMapPin /> {job.location}</p>
                  </div>
                  <div className="c2c-dwrx-field">
                    <label>Deadline</label>
                    <p><FaCalendarAlt /> {formatDate(job.timelineDate)}</p>
                  </div>
                </div>

                <div className="c2c-dwrx-msg-wrap">
                  <label>Client Message</label>
                  <p className="c2c-dwrx-message">“{job.description || job.message}”</p>
                </div>

                <div className="c2c-dwrx-client-info">
                  <FaPhoneAlt />
                  <p className="c2c-dwrx-client-value">+91 {job.mobile}</p>
                </div>
              </div>

              <div className="c2c-dwrx-card-right">
                <span className={`c2c-dwrx-status ${job.status}`}>
                  {job.status === "pending" ? "New Request" : job.status}
                </span>

                <div className="c2c-dwrx-buttons">
                  <button
                    className="c2c-dwrx-btn c2c-dwrx-secondary"
                    onClick={() => openClientRatings(job.userId)}
                  >
                    View Client Reputation
                  </button>

                  {job.status === "pending" && (
                    <div className="action-row">
                      <button className="c2c-dwrx-btn c2c-dwrx-accept" onClick={() => updateStatus(job.id, "accepted")}>Accept</button>
                      <button className="c2c-dwrx-btn c2c-dwrx-decline" onClick={() => updateStatus(job.id, "rejected")}>Decline</button>
                    </div>
                  )}

                  {job.status === "accepted" && (
                    <button className="c2c-dwrx-btn c2c-dwrx-complete" onClick={() => updateStatus(job.id, "completed")}>Mark Completed</button>
                  )}

                  {job.status === "completed" && !job.userRating && (
                    <button className="c2c-dwrx-btn c2c-dwrx-accept" onClick={() => openRateModal(job)}>Rate Client</button>
                  )}
                </div>

                {job.userRating && (
                  <div className="c2c-dwrx-given-rating">
                    <strong>You rated: {job.userRating.stars} ★</strong>
                    <p>{job.userRating.review}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RATING MODAL */}
      {rateModalOpen && rateTarget && (
        <div className="c2c-dwrx-modal-overlay" onClick={closeRateModal}>
          <div className="c2c-dwrx-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rate Client: {rateTarget.clientName}</h2>
              <button className="close-x" onClick={closeRateModal}><FaTimes /></button>
            </div>
            <div className="star-rating-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <FaStar key={n} className={n <= tempStars ? "star-active" : "star-inactive"} onClick={() => setTempStars(n)} />
              ))}
            </div>
            <textarea placeholder="Write a review..." className="review" value={tempReview} onChange={(e) => setTempReview(e.target.value)} />
            <div className="modal-actions">
              <button onClick={closeRateModal} className="cancel-btn">Cancel</button>
              <button
                className="c2c-dwrx-complete"
                onClick={submitUserRating}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  "Submit Rating"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT REPUTATION MODAL */}
      {clientRatingsModalOpen && (
        <div className="c2c-dwrx-modal-overlay" onClick={closeClientRatings}>
          <div className="c2c-dwrx-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Client Reputation</h2>
              <button className="close-x" onClick={closeClientRatings}><FaTimes /></button>
            </div>
            <div className="reviews-scroll-area">
              {ratingsLoading ? <p>Loading history...</p> : clientRatings.length === 0 ? <p>No history found for this client.</p> : (
                clientRatings.map((r, i) => (
                  <div key={i} className="review-card-mini">
                    <div className="review-header"><strong>{r.stars} ★</strong> <span>{formatDate(r.createdAt)}</span></div>
                    <p>“{r.review}”</p>
                    <small>— {r.designer?.fullname || "A Designer"}</small>
                  </div>
                ))
              )}
            </div>
            <button className="full-width" onClick={closeClientRatings}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default DesignerWorkReceived;