"use client";

import React, { useEffect, useState } from "react";
import "./DesignerDashboard.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPalette, FaEdit, FaUserTie, FaHandshake, FaBars, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { getDesignerBasic, updateDesignerAvailability } from "../../api/designer";
import Image from "next/image";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";
// 1. Import MessageBox
import MessageBox from "../ui/MessageBox"; 

const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const DesignerDashboard = () => {
  const router = useRouter();
  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerName, setDesignerName] = useState("Designer");
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [designerId, setDesignerId] = useState(null);

  // 2. Message Box State
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  // 3. Helper to trigger the message box
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

    getDesignerBasic(designerId)
      .then((data) => {
        setDesignerName(data.fullname?.trim() || "Designer");
        setAvailable(data.availability === "Available");
      })
      .catch((err) => console.error(err));
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
      
      // Replace alert with triggerMsg
      triggerMsg(`You are now ${newStatus}`, "success");
    } catch (err) {
      console.error("Failed to update availability:", err);
      // Replace alert with triggerMsg
      triggerMsg(err.response?.data?.message || "Failed to update availability", "error");
    } finally {
      setLoadingAvailability(false);
    }
  };

  return (
    <>
      {/* 4. Render MessageBox */}
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
            <Link href="/designerdashboard" className="nav-logo-link">
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
      </div>
    </>
  );
};

export default DesignerDashboard;