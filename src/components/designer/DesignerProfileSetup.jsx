"use client";

import React, { useState, useEffect } from "react";
import "./DesignerProfileSetup.css";
import { useRouter } from "next/navigation";
import { saveDesignerProfile } from "../../api/designer";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";
import MessageBox from "../ui/MessageBox";

const DesignerProfileSetup = () => {
  const router = useRouter();

  // 1. Initialize designerId as null in state
  const [designerId, setDesignerId] = useState(null);

  const [form, setForm] = useState({
    experience: "",
    portfolio: "",
    designerType: "",
    bio: "",
    profileImage: null,
    profilePreview: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  // Helper to trigger messages
  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
      CLIENT-SIDE DATA FETCHING
  ========================= */
  useEffect(() => {
    // 2. Access localStorage ONLY inside useEffect (Client-side)
    const storedId = localStorage.getItem("designerId");

    if (storedId) {
      setDesignerId(storedId);
    } else {
      // If no ID is found, the user shouldn't be here
      triggerMsg("Session expired. Please sign up again.");
      setTimeout(() => {
        router.push("/designersignup");
      }, 3000);
    }
  }, [router]);

  /* =========================
      IMAGE UPLOAD
  ========================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clean up old object URL to prevent memory leaks
    if (form.profilePreview) {
      URL.revokeObjectURL(form.profilePreview);
    }

    setForm((prev) => ({
      ...prev,
      profileImage: file,
      profilePreview: URL.createObjectURL(file),
    }));
  };

  /* =========================
      HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
      SUBMIT PROFILE (API)
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.profileImage) {
    triggerMsg("Please upload a profile image to continue.", "error");
    return;
  }

    if (!designerId) {
      triggerMsg("Authorisation error. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("designerId", designerId);
      formData.append("experience", form.experience);
      formData.append("portfolio", form.portfolio);
      formData.append("designerType", form.designerType);
      formData.append("bio", form.bio);

      if (form.profileImage) {
        formData.append("profileImage", form.profileImage);
      }

      await saveDesignerProfile(formData);

      // Successfully saved, move to portfolio
      router.push("/designerportfolio");
    } catch (err) {
      console.error("PROFILE SETUP ERROR:", err);
      const msg = err.response?.data?.message || "Server error. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 2. APPLY THE LOADING SPINNER DURING SUBMISSION */}
      {loading && <LoadingSpinner message="Saving your professional profile..." />}

      <div className="designer-setup-page">
        <div className="designer-setup-card">
          <h1 className="setup-title">Designer Profile Setup</h1>
          <p className="setup-subtitle">
            Tell us more about your design expertise to help customers find you.
          </p>

          {error && <p className="form-error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <form className="designer-form" onSubmit={handleSubmit}>
            {/* Profile Image */}
            <div className="field full">
              <label className="input-label">Profile Image (Optional)</label>

              <div className="profile-upload-box">
                {form.profilePreview ? (
                  <img
                    src={form.profilePreview}
                    alt="Preview"
                    className="profile-preview"
                  />
                ) : (
                  <div className="profile-placeholder">Upload Image</div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="profile-input"
                />
              </div>
            </div>

            <label className="input-label">Experience (in years)</label>
            <input
              type="number"
              name="experience"
              className="input-field"
              value={form.experience}
              onChange={handleChange}
              required
              min="0"
            />

            <label className="input-label">Portfolio Link (Optional)</label>
            <input
              type="url"
              name="portfolio"
              className="input-field"
              placeholder="Ex. https://portfolio.com"
              value={form.portfolio}
              onChange={handleChange}
            />

            <label className="input-label">Designer Type</label>
            <select
              className="input-field"
              name="designerType"
              value={form.designerType}
              onChange={handleChange}
              required
            >
              <option value="">Select type</option>
              <option value="Architect">Architect</option>
              <option value="Interior Designer">Interior Designer</option>
              <option value="Product Designer">Product Designer</option>
              <option value="Furniture Designer">Furniture Designer</option>
              <option value="Lighting Designer">Lighting Designer</option>
              <option value="3D Visualizer">3D Visualizer</option>
            </select>

            <label className="input-label">Short Bio</label>
            <textarea
              name="bio"
              className="input-field textarea"
              value={form.bio}
              onChange={handleChange}
              required
              placeholder="Briefly describe your style and approach..."
            />

            <button className="setup-btn" type="submit" disabled={loading || !designerId}>
              {loading ? "Saving..." : "Next"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DesignerProfileSetup;