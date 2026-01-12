"use client"; //

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./DesignerPortfolio.css";
import { saveDesignerPortfolio } from "../../api/designer";

const DesignerPortfolio = () => {
  const router = useRouter();
  const designerId = localStorage.getItem("designerId");

  const [works, setWorks] = useState([
    { image: null, preview: null, description: "" },
  ]);

  const [isFormEmpty, setIsFormEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("Designer not found. Please sign up again.");
      return;
    }

    if (isFormEmpty) {
      navigate("/designerdashboard");
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
      navigate("/designerdashboard");
    } catch (err) {
      console.error("PORTFOLIO ERROR:", err);
      if (err.response?.status === 400 || err.response?.status === 404) {
        setError(err.response.data.message);
      } else {
        setError("Server error. Please try again.");
      }
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
              className={`dp-submit ${
                isFormEmpty ? "dp-disabled" : ""
              }`}
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
  );
};

export default DesignerPortfolio;
