"use client";

import React, { useEffect, useState } from "react";
import "./DesignerDashboard.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FaPalette, FaEdit, FaUserTie, FaHandshake, 
  FaBars, FaTimes, FaToggleOn, FaToggleOff, FaStar 
} from "react-icons/fa";
import { getDesignerBasic, updateDesignerAvailability } from "../../api/designer";
import Image from "next/image";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";
import MessageBox from "../ui/MessageBox"; 
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const DesignerDashboard = () => {
  const router = useRouter();
  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerName, setDesignerName] = useState("Designer");
  const [loading, setLoading] = useState(true); // Initial load state
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [designerId, setDesignerId] = useState(null);

  // Ratings & UI States
  const [ratingData, setRatingData] = useState({ avg: 0, total: 0, reviews: [] });
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDesignerId(localStorage.getItem("designerId"));
    }
  }, []);

  useEffect(() => {
    if (!designerId) return;

    setLoading(true);
    getDesignerBasic(designerId)
      .then((data) => {
        setDesignerName(data.fullname?.trim() || "Designer");
        setAvailable(data.availability === "Available");
        setRatingData({
          avg: data.avgRating || 0,
          total: data.totalRatings || 0,
          reviews: data.ratings || []
        });
      })
      .catch((err) => console.error("Error fetching dashboard data:", err))
      .finally(() => setLoading(false));
  }, [designerId]);

  const toggleAvailability = async () => {
    if (!designerId) {
      triggerMsg("Session expired. Please login again.", "error");
      return;
    }

    const newStatus = available ? "Unavailable" : "Available";

    try {
      setLoadingAvailability(true);
      await updateDesignerAvailability(designerId, newStatus);
      setAvailable(newStatus === "Available");
      triggerMsg(`You are now ${newStatus}`, "success");
    } catch (err) {
      console.error("Failed to update availability:", err);
      triggerMsg(err.response?.data?.message || "Failed to update availability", "error");
    } finally {
      setLoadingAvailability(false);
    }
  };

  // 2. SHOW SPINNER DURING INITIAL FETCH
  if (loading) return <LoadingSpinner message="Opening designer console..." />;

  return (
    <>
      {/* 3. SHOW SPINNER DURING AVAILABILITY TOGGLE */}
      {loadingAvailability && <LoadingSpinner message="Updating status..." />}

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
            <Link 
              href="/" 
              className="nav-logo-link" 
              draggable="true"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="nav-logo-wrap">
                <Image
                  src={CoreToCoverLogo}
                  alt="CoreToCover Logo"
                  width={120}
                  height={50}
                  priority
                  style={{ height: 'auto', width: '50px' }}
                />
                <BrandBold>Core2Cover</BrandBold>
              </span>
            </Link>
          </div>

          <div className="nav-right">
            <div className="hamburger always-visible" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li>
                <Link href="/login" className="seller-btn" onClick={() => setMenuOpen(false)}>
                  Login as Customer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="dd-dashboard">
        <div className="dd-header dd-reveal">
          <div className="dd-header-left">
            <h1 className="dd-title">Welcome, {designerName}</h1>
            <p className="dd-sub">Manage your portfolio and leads from your private dashboard.</p>
          </div>
          
          <div className="dd-header-stats">
            <div className="stat-item">
              <span className="stat-value">{ratingData.avg} <FaStar style={{color: '#ca8a04', fontSize: '1.2rem'}} /></span>
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{ratingData.total}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
          </div>
        </div>

        <div className="dd-grid">
          <div className="dd-card dd-reveal dd-delay-1" onClick={() => router.push("/designerexperience")}>
            <div className="dd-icon"><FaPalette /></div>
            <h3>My Portfolio</h3>
            <p>Upload and showcase your best design works.</p>
          </div>
          
          <div className="dd-card dd-reveal dd-delay-2" onClick={() => router.push("/designerworkreceived")}>
            <div className="dd-icon"><FaHandshake /></div>
            <h3>Work Received</h3>
            <p>View and manage project requests from customers.</p>
          </div>

          <div className="dd-card dd-reveal dd-delay-3" onClick={() => router.push("/designereditprofile")}>
            <div className="dd-icon"><FaEdit /></div>
            <h3>Edit Profile</h3>
            <p>Update your bio, location, and professional details.</p>
          </div>

          <div className="dd-card dd-reveal dd-delay-4">
            <div className="dd-icon"><FaUserTie /></div>
            <h3>Designer Settings</h3>
            <div className="dd-setting-card">
              <div className="dd-setting-info">
                <h3>Availability</h3>
                <p style={{ fontSize: '0.8rem' }}>
                  {available ? "Showing in search results" : "Currently hidden from search"}
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

        <div className="dd-full-history dd-reveal dd-delay-5">
          <div className="history-header">
            <h3>Client Feedback History</h3>
            <div className="history-count">Showing {ratingData.reviews.length} reviews</div>
          </div>

          {ratingData.reviews.length > 0 ? (
            <div className="history-list">
              {ratingData.reviews.map((rev, index) => {
                const displayName = rev.reviewerName || "Client";
                
                return (
                  <div key={index} className="history-item">
                    <div className="history-item-top">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {displayName[0].toUpperCase()}
                        </div>
                        <div className="reviewer-details">
                          <span className="name">{displayName}</span>
                          <span className="date">
                            {new Date(rev.createdAt).toLocaleDateString('en-GB', { 
                              day: 'numeric', month: 'long', year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < rev.stars ? "star-active" : "star-inactive"} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="history-item-body">
                      <p className="comment">"{rev.review || "The client didn't leave a written comment."}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-history">
              <p>No feedback received yet. Complete hire requests to start building your reputation.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DesignerDashboard;