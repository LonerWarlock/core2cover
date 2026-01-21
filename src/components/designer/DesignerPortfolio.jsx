"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./DesignerPortfolio.css";
import { saveDesignerPortfolio } from "../../api/designer";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const DesignerPortfolio = () => {
  const router = useRouter();
  
  // 1. Initialize designerId in state to avoid server-side crash
  const [designerId, setDesignerId] = useState(null);

  const [works, setWorks] = useState([
    { image: null, preview: null, description: "" },
  ]);

  const [isFormEmpty, setIsFormEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
      GET DESIGNER ID (Browser Only)
  ========================= */
  useEffect(() => {
    const storedId = localStorage.getItem("designerId");
    if (storedId) {
      setDesignerId(storedId);
    } else {
      setError("Designer session not found. Redirecting...");
      setTimeout(() => router.push("/designersignup"), 3000);
    }
  }, [router]);

  /* =========================
      CHECK EMPTY STATE
  ========================= */
  useEffect(() => {
    const empty = works.every(
      (w) =>
        !w.image &&
        (typeof w.description !== "string" || w.description.trim() === "")
    );
    setIsFormEmpty(empty);
  }, [works]);

  /* =========================
      ADD WORK
  ========================= */
  const addWork = () => {
    if (works.length >= 5) return;
    setWorks((s) => [...s, { image: null, preview: null, description: "" }]);
  };

  /* =========================
      IMAGE CHANGE
  ========================= */
  const handleImageChange = (index, file) => {
    if (!file) return;

    setWorks((prev) => {
      const updated = [...prev];
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = {
        ...updated[index],
        image: file,
        preview: URL.createObjectURL(file),
      };
      return updated;
    });
  };

  /* =========================
      DESCRIPTION CHANGE
  ========================= */
  const handleDescriptionChange = (index, value) => {
    setWorks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description: value };
      return updated;
    });
  };

  /* =========================
      SUBMIT PORTFOLIO
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!designerId) {
      setError("Designer identity missing. Please login again.");
      return;
    }

    // If they click Save but haven't added anything, just treat it as a skip
    if (isFormEmpty) {
      router.push("/designerdashboard");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("designerId", designerId);

      works.forEach((w) => {
        if (w.image) {
          formData.append("images", w.image);
          formData.append("descriptions", w.description || "");
        }
      });

      await saveDesignerPortfolio(formData);
      router.push("/designerdashboard");
    } catch (err) {
      console.error("PORTFOLIO ERROR:", err);
      const msg = err.response?.data?.message || "Server error. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      CLEANUP PREVIEWS
  ========================= */
  useEffect(() => {
    return () => {
      works.forEach((w) => {
        if (w.preview) URL.revokeObjectURL(w.preview);
      });
    };
  }, [works]); 

  return (
    <>
      {/* 2. APPLY THE LOADING SPINNER DURING SUBMISSION */}
      {loading && <LoadingSpinner message="Uploading your portfolio showcase..." />}

      <div className="dp-page">
        <div className="dp-box dp-reveal">
          <h1 className="dp-title">Show Your Best Work</h1>
          <p className="dp-subtitle">
            Add 4–5 examples of your previous designs. <strong>(Optional)</strong>
          </p>

          {error && <p className="dp-error">{error}</p>}

          <form onSubmit={handleSubmit} className="dp-form">
            {works.map((item, index) => (
              <div key={index} className="dp-work">
                <div className="dp-image-upload">
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt="Preview"
                      className="dp-preview"
                    />
                  ) : (
                    <label className="dp-upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(index, e.target.files?.[0])
                        }
                      />
                      + Upload Image
                    </label>
                  )}
                </div>

                <textarea
                  className="dp-description"
                  placeholder="Write something about this work..."
                  value={item.description}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                />
              </div>
            ))}

            {works.length < 5 && (
              <button type="button" className="dp-add-btn" onClick={addWork}>
                + Add Another Work
              </button>
            )}

            <div className="dp-actions">
              <button
                type="submit"
                className={`dp-submit ${isFormEmpty ? "dp-disabled" : ""}`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save & Continue"}
              </button>

              <button
                type="button"
                className="dp-skip"
                onClick={() => router.push("/designerdashboard")}
              >
                Skip for Now →
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DesignerPortfolio;