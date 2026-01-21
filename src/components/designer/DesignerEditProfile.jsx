"use client";

import React, { useState, useEffect } from "react";
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
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const DesignerEditProfile = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerId, setDesignerId] = useState(null);

  // Message Box State
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
  const [loading, setLoading] = useState(true); // Set initial loading to true for fetch
  const [isUpdating, setIsUpdating] = useState(false); // New state for form submission
  const [error, setError] = useState("");

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
      INITIALISE & AUTH CHECK
  ========================= */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("designerId");
      if (!id) {
        router.push("/designersignup");
      } else {
        setDesignerId(id);
      }
    }
  }, [router]);

  /* =========================
      FETCH PROFILE (API)
  ========================= */
  useEffect(() => {
    if (!designerId) return;

    setLoading(true);
    getDesignerEditProfile(designerId)
      .then((data) => {
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
      })
      .catch((err) => {
        console.error(err);
        triggerMsg("Failed to load profile details.", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [designerId]);

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
      SUBMIT UPDATE (API)
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsUpdating(true); // 2. SHOW SPINNER DURING UPDATE

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

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

  // 3. SHOW SPINNER FOR INITIAL DATA FETCH
  if (loading) return <LoadingSpinner message="Opening profile settings..." />;

  return (
    <>
      {/* 4. SHOW SPINNER FOR SUBMISSION */}
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
              draggable="true"
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

      <div className="de-navigation-top de-reveal">
        <button className="de-back-btn" onClick={() => router.push("/designerdashboard")}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
      <div className="dep-page">
        <div className="dep-container dep-reveal">
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