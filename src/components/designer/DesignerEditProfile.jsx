"use client";

import React, { useState, useEffect } from "react";
import "./DesignerEditProfile.css";
import "./DesignerDashboard.css";
import { FaCamera, FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getDesignerEditProfile,
  updateDesignerEditProfile,
} from "../../api/designer";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";

const Brand = ({ children }) => <span className="brand">{children}</span>;
const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const DesignerEditProfile = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerId, setDesignerId] = useState(null);

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        setError("Failed to load profile details.");
      });
  }, [designerId]);

  /* =========================
      INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
      IMAGE CHANGE
  ========================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
      SUBMIT UPDATE (API)
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await updateDesignerEditProfile(designerId, formData);

      alert("Profile updated successfully ✅");
      router.push("/designerdashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/designerdashboard" className="nav-link nav-logo-link">
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

      {/* PAGE */}
      <div className="dep-page">
        <div className="dep-container dep-reveal">
          <h1 className="dep-title">Edit Profile</h1>
          <p className="dep-sub">
            Update your personal information and designer details.
          </p>

          {error && <p className="dep-error">{error}</p>}

          {/* IMAGE SECTION */}
          <div className="dep-image-section">
            <div className="dep-image-wrapper">
              {preview ? (
                /* Native img is fine for previews/dynamic blobs */
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

          {/* FORM */}
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

            <button type="submit" className="dep-save-btn" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DesignerEditProfile;