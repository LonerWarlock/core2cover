"use client";

import React, { useState, useEffect, useCallback } from "react";
import "./DesignerEditProfile.css";
import "./DesignerDashboard.css";
import { FaCamera, FaBars, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getDesignerEditProfile,
  updateDesignerProfile,
} from "../../api/designer";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";
import MessageBox from "../ui/MessageBox";
import LoadingSpinner from "../ui/LoadingSpinner";

const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const DesignerEditProfile = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerId, setDesignerId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    mobile: "",
    location: "",
    experience: "",
    portfolio: "",
    bio: "",
    designerType: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isUpdating, setIsUpdating] = useState(false); 
  const [error, setError] = useState("");

  /* =========================================
      EASY ENCRYPTION HELPERS
  ========================================= */
  const secureGetItem = useCallback((key) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    try {
      // Decodes the scrambled ID from the Application Tab
      return item ? atob(item) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const decodePayload = useCallback((payload) => {
    try {
      // Decodes backend profile payload if encrypted
      const decodedString = atob(payload);
      return JSON.parse(decodedString);
    } catch (e) {
      console.error("Profile decryption failed:", e);
      return null;
    }
  }, []);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================================
      STABLE IDENTITY INITIALISATION
  ========================================= */
  useEffect(() => {
    const id = secureGetItem("designerId");
    if (!id) {
      router.push("/designerlogin");
    } else {
      setDesignerId(id);
    }
  }, [router, secureGetItem]);

  /* =========================================
      STABLE FETCH PROFILE
  ========================================= */
  useEffect(() => {
    if (!designerId) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await getDesignerEditProfile(designerId);
        
        // Handle potential encrypted payload from backend
        const data = res?.payload ? decodePayload(res.payload) : res;

        setForm({
          fullname: data.fullname || "",
          email: data.email || "",
          mobile: data.mobile || "",
          location: data.location || "",
          experience: data.experience || "",
          portfolio: data.portfolio || "",
          bio: data.bio || "",
          designerType: data.designerType || "",
        });

        if (data.profileImage) {
          setPreview(data.profileImage);
        }
      } catch (err) {
        console.error("Profile Load Error:", err);
        triggerMsg("Failed to load profile details.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [designerId, decodePayload]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
      SUBMIT UPDATE
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsUpdating(true); 

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      // Use actual decoded ID for backend verification
      await updateDesignerProfile(designerId, formData);

      triggerMsg("Profile updated successfully", "success");

      setTimeout(() => {
        router.push("/designerdashboard");
      }, 2000);

    } catch (err) {
      console.error(err);
      triggerMsg(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening profile settings..." />;

  return (
    <>
      {isUpdating && <LoadingSpinner message="Updating your professional profile..." />}

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
              className="nav-link nav-logo-link" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="nav-logo-wrap">
                <Image
                  src={CoreToCoverLogo}
                  alt="CoreToCover"
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
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li>
                <Link href="/login" className="seller-btn">
                  Login as Customer
                </Link>
              </li>
            </ul>

            <div
              className="hamburger always-visible"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </header>

      <div className="de-navigation-top">
        <button className="de-back-btn" onClick={() => router.push("/designerdashboard")}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
      <div className="dep-page">
        <div className="dep-container">
          <h1 className="dep-title">Edit Profile</h1>
          <p className="dep-sub">
            Update your personal information and designer details.
          </p>

          <div className="dep-image-section">
            <div className="dep-image-wrapper">
              {preview ? (
                <img src={preview} alt="Profile Preview" className="dep-profile-img" />
              ) : (
                <div className="dep-placeholder">
                  <FaCamera className="dep-camera-icon" />
                </div>
              )}

              <label className="dep-upload-btn">
                Change Photo
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>
          </div>

          <form className="dep-form" onSubmit={handleSubmit}>
            <div className="dep-field">
              <label>Full Name</label>
              <input
                name="fullname"
                placeholder="Enter full name"
                value={form.fullname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="dep-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="dep-field">
              <label>Mobile Number</label>
              <input
                name="mobile"
                placeholder="Mobile number"
                value={form.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="dep-field">
              <label>Location</label>
              <input
                name="location"
                placeholder="City, State"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div className="dep-field">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experience"
                placeholder="e.g. 5"
                value={form.experience}
                onChange={handleChange}
              />
            </div>

            <div className="dep-field">
              <label>Portfolio Link</label>
              <input
                name="portfolio"
                placeholder="https://behance.net/yourname"
                value={form.portfolio}
                onChange={handleChange}
              />
            </div>

            <div className="dep-field dep-full">
              <label>Bio</label>
              <textarea
                name="bio"
                placeholder="Tell clients about your style..."
                value={form.bio}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="dep-save-btn" disabled={isUpdating}>
              {isUpdating ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DesignerEditProfile;