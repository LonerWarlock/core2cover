"use client";

import React, { useState, useEffect, useCallback } from "react";
import "./DesignerExperience.css";
import "./DesignerDashboard.css";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";
import api from "../../api/axios";
import LoadingSpinner from "../ui/LoadingSpinner";

const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const DesignerExperience = () => {
  const router = useRouter();
  const [works, setWorks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [savingId, setSavingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [designerId, setDesignerId] = useState(null);

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
      // Decodes the backend portfolio payload
      const decodedString = atob(payload);
      return JSON.parse(decodedString);
    } catch (e) {
      console.error("Portfolio decryption failed:", e);
      return null;
    }
  }, []);

  /* =========================================
      STABLE IDENTITY INITIALISATION
  ========================================= */
  useEffect(() => {
    const sid = secureGetItem("designerId");
    if (sid) {
      setDesignerId(sid);
    } else {
      router.push("/designerlogin");
    }
  }, [router, secureGetItem]);

  /* =========================================
      STABLE DATA FETCHING
  ========================================= */
  useEffect(() => {
    if (!designerId) return;

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/designer/${designerId}/portfolio`);
        
        // Handle potential encrypted payload from backend
        let rawData = [];
        if (res.data?.payload) {
          rawData = decodePayload(res.data.payload) || [];
        } else {
          rawData = Array.isArray(res.data) ? res.data : [];
        }

        const mapped = rawData.map(w => ({
          ...w,
          preview: w.image, 
          isNew: false
        }));
        setWorks(mapped);
      } catch (err) {
        console.error("Fetch Portfolio Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [designerId, decodePayload]);

  /* =========================================
      UI ACTIONS
  ========================================= */
  const addWork = () => {
    if (works.length >= 5) return;
    setWorks((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        image: null,
        preview: null,
        description: "",
        isNew: true,
      },
    ]);
  };

  const handleImageChange = (id, file) => {
    if (!file) return;
    setWorks((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, image: file, preview: URL.createObjectURL(file) }
          : w
      )
    );
  };

  const handleDescriptionChange = (id, value) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, description: value } : w
      )
    );
  };

  /* =========================================
      SAVE / UPDATE WORK
  ========================================= */
  const saveWork = async (work) => {
    if (!work.description && !work.image) {
      alert("Please add an image or description");
      return;
    }

    setSavingId(work.id);
    const formData = new FormData();
    // Use the decoded designerId for the backend
    formData.append("designerId", designerId);
    formData.append("description", work.description || "");

    if (work.image instanceof File) {
      formData.append("image", work.image);
    }

    try {
      let res;
      if (work.isNew) {
        res = await api.post(`/designer/portfolio`, formData);
      } else {
        res = await api.put(`/designer/portfolio/${work.id}`, formData);
      }

      // Handle payload response if backend is encrypted
      const responseData = res.data?.payload ? decodePayload(res.data.payload) : res.data;
      const workData = responseData.work || responseData;

      const updatedWork = {
        ...workData,
        preview: workData.image,
        isNew: false
      };

      setWorks((prev) =>
        prev.map((w) => (w.id === work.id ? updatedWork : w))
      );
      alert("Work saved successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save work");
    } finally {
      setSavingId(null);
    }
  };

  const deleteWork = async (id) => {
    if (!window.confirm("Delete this work?")) return;

    if (String(id).startsWith("new-")) {
      setWorks((prev) => prev.filter((w) => w.id !== id));
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/designer/portfolio/${id}`);
      setWorks((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete work");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your portfolio..." />;

  return (
    <>
      {savingId && <LoadingSpinner message="Uploading masterpiece..." />}
      {isDeleting && <LoadingSpinner message="Removing work item..." />}

      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-logo-link" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="nav-logo-wrap">
                <Image src={CoreToCoverLogo} alt="Logo" width={120} height={50} priority style={{ height: 'auto', width: '50px' }} />
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

      <div className="de-page">
        <div className="de-navigation-top">
          <button className="de-back-btn" onClick={() => router.push("/designerdashboard")}>
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
        <div className="de-header">
          <h1 className="de-title">My Work Experience</h1>
          <p className="de-subtitle">Showcase your best interior & product designs.</p>
        </div>

        {works.length === 0 && (
          <div className="de-empty">
            <img src="https://cdn-icons-png.flaticon.com/512/9541/9541430.png" alt="Empty" width={100} />
            <p className="de-empty-text">You have not added any work yet</p>
            <button className="de-empty-btn" onClick={addWork}>
              I want to add my work experience
            </button>
          </div>
        )}

        <div className="de-list">
          {works.map((work) => (
            <div key={work.id} className="de-item">
              <label className="de-image">
                {work.preview ? (
                  <img src={work.preview} alt="work" unoptimized/>
                ) : (
                  <div className="de-image-placeholder">
                    <FaPlus />
                    <span>Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(work.id, e.target.files[0])}
                />
              </label>

              <div className="de-details">
                <textarea
                  className="de-description"
                  placeholder="Describe your work..."
                  value={work.description || ""}
                  onChange={(e) => handleDescriptionChange(work.id, e.target.value)}
                />

                <div className="de-actions">
                  <button
                    className="de-save-btn"
                    onClick={() => saveWork(work)}
                    disabled={savingId === work.id}
                  >
                    <FaSave />
                    {savingId === work.id ? "Saving..." : "Save"}
                  </button>
                  <button className="de-delete-btn" onClick={() => deleteWork(work.id)}>
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {works.length > 0 && works.length < 5 && (
          <button className="de-add-btn" onClick={addWork}>
            <FaPlus /> Add New Work ({works.length}/5)
          </button>
        )}
      </div>
    </>
  );
};

export default DesignerExperience;