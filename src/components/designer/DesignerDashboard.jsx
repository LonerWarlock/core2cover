"use client";

import React, { useEffect, useState } from "react";
import "./DesignerDashboard.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPalette, FaEdit, FaUserTie, FaHandshake, FaBars, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { getDesignerBasic, updateDesignerAvailability } from "../../api/designer";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";
import Image from "next/image";

const Brand = ({ children }) => <span className="brand">{children}</span>;

// ... renderStarsInline helper remains same ...

const DesignerDashboard = () => {
  const router = useRouter();
  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerName, setDesignerName] = useState("Designer");
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  //const [ratingsSummary, setRatingsSummary] = useState(null);
  //const [ratingsError, setRatingsError] = useState("");
  const [designerId, setDesignerId] = useState(null);

  useEffect(() => {
    setDesignerId(localStorage.getItem("designerId"));
  }, []);

  useEffect(() => {
    if (!designerId) return;

    getDesignerBasic(designerId)
      .then((data) => {
        setDesignerName(data.fullname?.trim() || "Designer");
        setAvailable(data.availability === "Available");
      })
      .catch((err) => console.error(err));

    // FIX: Use relative API path
    const loadRatings = async () => {
      try {
        const res = await fetch(`/api/designer/${designerId}/ratings`);
        if (!res.ok) throw new Error("Failed to load ratings");
        const data = await res.json();
        setRatingsSummary(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setRatingsError("Failed to load ratings");
      }
    };
    loadRatings();
  }, [designerId]);

  const toggleAvailability = async () => {
    if (!designerId) return;
    const newStatus = available ? "Unavailable" : "Available";
    try {
      setLoadingAvailability(true);
      await updateDesignerAvailability(designerId, newStatus);
      setAvailable(!available);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) { alert("Failed to update availability"); } finally { setLoadingAvailability(false); }
  };

  // ... (JSX remains similar, ensure onClick navigation uses router.push) ...

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/designerdashboard" className="nav-link nav-logo-link">
               <span className="nav-logo-wrap"><Image src={CoreToCoverLogo.src || CoreToCoverLogo} alt="Logo" className="nav-logo" /><Brand>Core2Cover</Brand></span>
            </Link>
          </div>
          <div className="nav-right">
             <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
               <li><Link href="/login" className="seller-btn">Login as Customer</Link></li>
             </ul>
             <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <FaTimes /> : <FaBars />}</div>
          </div>
        </div>
      </header>

      <div className="dd-dashboard">
        {/* ... Header Section ... */}
        <div className="dd-header dd-reveal">
           <div className="dd-header-left"><h1 className="dd-title">Welcome, {designerName}</h1><p className="dd-sub">Manage your portfolio...</p></div>
           {/* ... Ratings Summary ... */}
        </div>

        <div className="dd-grid">
          <div className="dd-card dd-reveal dd-delay-1" onClick={() => router.push("/designerexperience")}>
             <div className="dd-icon"><FaPalette /></div><h3>My Portfolio</h3><p>Upload...</p>
          </div>
          <div className="dd-card dd-reveal dd-delay-2" onClick={() => router.push("/designerworkreceived")}>
             <div className="dd-icon"><FaHandshake /></div><h3>Work Received</h3><p>See customers...</p>
          </div>
          <div className="dd-card dd-reveal dd-delay-3" onClick={() => router.push("/designereditprofile")}>
             <div className="dd-icon"><FaEdit /></div><h3>Edit Profile</h3><p>Update details...</p>
          </div>
          
          <div className="dd-card dd-reveal dd-delay-4">
            <div className="dd-icon"><FaUserTie /></div><h3>Designer Settings</h3>
            <div className="dd-setting-card">
               <div className="dd-setting-info"><h3>Availability</h3></div>
               <button className="dd-toggle-btn" onClick={toggleAvailability} disabled={loadingAvailability}>
                 {available ? <FaToggleOn className="dd-toggle-icon dd-on" /> : <FaToggleOff className="dd-toggle-icon dd-off" />}
               </button>
            </div>
          </div>
        </div>
        
        {/* ... Reviews Section ... */}
      </div>
    </>
  );
};
export default DesignerDashboard;