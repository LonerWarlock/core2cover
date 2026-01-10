import React, { useState, useEffect } from "react";
import "./DesignerEditProfile.css";
import { FaCamera, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {
  getDesignerEditProfile,
  updateDesignerEditProfile,
} from "../../api/designer";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png"

const Brand = ({ children }) => <span className="brand">{children}</span>;
const DesignerEditProfile = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const designerId = localStorage.getItem("designerId");

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
     REDIRECT IF NOT LOGGED IN
  ========================= */
  useEffect(() => {
    if (!designerId) {
      navigate("/designersignup");
    }
  }, [designerId, navigate]);

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
        setError("Failed to load profile");
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

      alert("Profile updated successfully");
      navigate("/designerdashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR — kept unchanged intentionally */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/designerdashboard" className="nav-link nav-logo-link">
              <span className="nav-logo-wrap">
                <img
                  src={CoreToCoverLogo}
                  alt="CoreToCover"
                  className="nav-logo"
                /><Brand>Core2Cover</Brand>
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

      {/* PAGE — all classes prefixed with dep- */}
      <div className="dep-page">
        <div className="dep-container dep-reveal">
          <h1 className="dep-title">Edit Profile</h1>
          <p className="dep-sub">
            Update your personal information and designer details.
          </p>

          {error && <p className="dep-error">{error}</p>}

          {/* IMAGE */}
          <div className="dep-image-section">
            <div className="dep-image-wrapper">
              {preview ? (
                <img src={preview} alt="Profile" className="dep-profile-img" />
              ) : (
                <div className="dep-placeholder">
                  <FaCamera className="dep-camera-icon" />
                </div>
              )}

              <label className="dep-upload-btn">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* FORM */}
          <form className="dep-form" onSubmit={handleSubmit}>
            <div className="dep-field">
              <label>Full Name</label>
              <input name="fullname" value={form.fullname} onChange={handleChange} required />
            </div>

            <div className="dep-field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="dep-field">
              <label>Mobile Number</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} required />
            </div>

            <div className="dep-field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="dep-field">
              <label>Experience</label>
              <input type="number" name="experience" value={form.experience} onChange={handleChange} />
            </div>

            <div className="dep-field">
              <label>Portfolio Link</label>
              <input name="portfolio" value={form.portfolio} onChange={handleChange} />
            </div>

            <div className="dep-field">
              <label>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} />
            </div>

            <button className="dep-save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DesignerEditProfile;
