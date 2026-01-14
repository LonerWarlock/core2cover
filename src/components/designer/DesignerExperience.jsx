"use client";

import React, { useState, useEffect } from "react";
import "./DesignerExperience.css";
import "./DesignerDashboard.css"
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaPlus,
  FaTrashAlt,
  FaSave,
} from "react-icons/fa";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png"
import api from "../../api/axios"; // Use your configured axios instance

const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const DesignerExperience = () => {
  const router = useRouter();
  const [works, setWorks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [designerId, setDesignerId] = useState(null);

  /* =========================
      INITIALISE DESIGNER ID
  ========================= */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("designerId");
      if (storedId) {
        setDesignerId(storedId);
      } else {
        router.push("/designersignup");
      }
    }
  }, [router]);

  /* =========================
      FETCH PORTFOLIO
  ========================= */
  useEffect(() => {
    if (!designerId) return;

    api.get(`/designer/${designerId}/portfolio`)
      .then((res) => {
        // Map data to include previews for existing images
        const mapped = res.data.map(w => ({
            ...w,
            preview: w.image, // Cloudinary URL
            isNew: false
        }));
        setWorks(mapped);
      })
      .catch(err => console.error("Fetch Portfolio Error:", err));
  }, [designerId]);

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

  /* =========================
      SAVE / UPDATE WORK
  ========================= */
  const saveWork = async (work) => {
    if (!work.description && !work.image) {
      alert("Please add an image or description");
      return;
    }

    setSavingId(work.id);
    const formData = new FormData();
    formData.append("designerId", designerId);
    formData.append("description", work.description || "");
    
    // Only append if it's a new file object
    if (work.image instanceof File) {
        formData.append("image", work.image);
    }

    try {
      let res;
      if (work.isNew) {
        res = await api.post(`/designer/portfolio`, formData);
      } else {
        // Dynamic route for updates
        res = await api.put(`/designer/portfolio/${work.id}`, formData);
      }

      const updatedWork = { 
          ...res.data.work, 
          preview: res.data.work.image, 
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
      await api.delete(`/designer/portfolio/${id}`);
      setWorks((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete work");
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/designerdashboard" className="nav-logo-link">
              <span className="nav-logo-wrap">
                <Image
                  src={CoreToCoverLogo}
                  alt="CoreToCover Logo"
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
        <div className="de-header de-reveal">
          <h1 className="de-title">My Work Experience</h1>
          <p className="de-subtitle">Showcase your best interior & product designs.</p>
        </div>

        {works.length === 0 && (
          <div className="de-empty de-reveal">
            <img src="https://cdn-icons-png.flaticon.com/512/9541/9541430.png" alt="Empty" width={100} />
            <p className="de-empty-text">You have not added any work yet</p>
            <button className="de-empty-btn" onClick={addWork}>
              I want to add my work experience
            </button>
          </div>
        )}

        <div className="de-list">
          {works.map((work) => (
            <div key={work.id} className="de-item de-reveal">
              <label className="de-image">
                {work.preview ? (
                  <img src={work.preview} alt="work" />
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