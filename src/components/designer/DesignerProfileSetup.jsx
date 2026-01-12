"use client";

import React, { useState, useEffect } from "react";
import "./DesignerProfileSetup.css";
import { useRouter } from "next/navigation";
import { saveDesignerProfile } from "../../api/designer";

const DesignerProfileSetup = () => {
  const router = useRouter();
  const designerId = localStorage.getItem("designerId");

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

  /* =========================
     REDIRECT IF NO DESIGNER
  ========================= */
  useEffect(() => {
    // This code only runs in the browser
    const storedId = localStorage.getItem("designerId");
    if (storedId) {
      setDesignerId(storedId);
    } else {
      // Optional: Redirect to signup if no ID is found
      // router.push("/designersignup");
    }
  }, []);

  
  /* =========================
     IMAGE UPLOAD
  ========================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

      // ✅ next step
      router.push("/designerportfolio");
    } catch (err) {
      console.error("PROFILE SETUP ERROR:", err);

      if (err.response?.status === 400 || err.response?.status === 404) {
        setError(err.response.data.message);
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-setup-page">
      <div className="designer-setup-card">
        <h1 className="setup-title">Designer Profile Setup</h1>
        <p className="setup-subtitle">
          Tell us more about your design expertise to help customers find you.
        </p>

        {error && <p className="form-error">{error}</p>}

        <form className="designer-form" onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="field full">
            <label>Profile Image</label>

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
          />

          <label className="input-label">Portfolio Link (Optional)</label>
          <input
            type="text"
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
            <option value="Interior Designer">Interior Designer</option>
            <option value="Product Designer">Product Designer</option>
            <option value="Furniture Designer">Furniture Designer</option>
            <option value="Lighting Designer">Lighting Designer</option>
            <option value="3D Visualizer / CAD Designer">
              3D Visualizer / CAD Designer
            </option>
          </select>

          <label className="input-label">Short Bio</label>
          <textarea
            name="bio"
            className="input-field textarea"
            value={form.bio}
            onChange={handleChange}
            required
          />

          <button className="setup-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DesignerProfileSetup;
