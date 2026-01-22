"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./SellerProfile.css";
import Sidebar from "./Sidebar";
import { getSellerProfile, updateSellerProfile } from "../../api/seller";
import MessageBox from "../ui/MessageBox";
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerProfile = () => {
  const router = useRouter();
  const [sellerId, setSellerId] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  /* =========================================
      ENCRYPTION HELPERS
  ========================================= */
  const secureSetItem = (key, value) => {
    if (!value) return;
    localStorage.setItem(key, btoa(String(value)));
  };

  const secureGetItem = (key) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    try {
      return item ? atob(item) : null;
    } catch (e) {
      return null;
    }
  };

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
      1. AUTH CHECK
  ========================= */
  useEffect(() => {
    const sid = secureGetItem("sellerId");
    if (!sid) {
      router.push("/sellerlogin");
    } else {
      setSellerId(sid);
    }
  }, [router]);

  /* =========================
      2. FETCH DATA
  ========================= */
  useEffect(() => {
    if (!sellerId) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await getSellerProfile(sellerId);
        
        // Decode payload if backend is already sending encrypted data
        const data = res.data?.payload 
          ? JSON.parse(atob(res.data.payload)) 
          : (res.data || res);

        const profileData = {
          name: data.name || "Not specified",
          email: data.email || "Not specified",
          phone: data.phone || "Not specified",
          location: data.location || data.business?.city || "Not specified"
        };

        setProfile(profileData);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });

      } catch (err) {
        console.error("Profile Load Error:", err);
        triggerMsg("Failed to load profile details", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [sellerId]);

  /* =========================
      3. SAVE DATA
  ========================= */
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      triggerMsg("Name and phone are required", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await updateSellerProfile(sellerId, {
        name: formData.name,
        phone: formData.phone,
      });

      const updated = res.data?.payload 
        ? JSON.parse(atob(res.data.payload)) 
        : (res.data?.seller || res.data || res);
      
      setProfile((prev) => ({
        ...prev,
        name: updated.name,
        phone: updated.phone,
      }));

      // Update the scrambled storage markers
      secureSetItem("userName", updated.name);

      setIsEditing(false);
      triggerMsg("Profile updated successfully", "success");
    } catch (err) {
      triggerMsg(err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/sellerlogin");
  };

  return (
    <>
      {loading && <LoadingSpinner message="Initialising Profile Details..." />}
      {saving && <LoadingSpinner message="Updating your profile details..." />}

      <div className="bs-layout-root">
        {msg.show && (
          <MessageBox 
            message={msg.text} 
            type={msg.type} 
            onClose={() => setMsg({ ...msg, show: false })} 
          />
        )}
        <Sidebar />
        <div className="bs-profile-shell">
          <h1 className="bs-heading">Seller Account</h1>

          {!loading && (
            <>
              {!isEditing ? (
                <div className="bs-card profile-view-card business-reveal">
                  <div className="profile-info-group">
                    <div className="info-row">
                      <span className="info-label">Business Name:</span>
                      <span className="info-value">{profile.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Login Email:</span>
                      <span className="info-value">{profile.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Contact Number:</span>
                      <span className="info-value">{profile.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Primary Location:</span>
                      <span className="info-value">{profile.location}</span>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button className="bs-btn bs-btn--primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </button>
                    <button className="bs-btn bs-btn--ghost" onClick={handleLogout}>
                      Logout Account
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  className="bs-card bs-edit-form business-reveal"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  <div className="input-field">
                    <label>Full Name / Business Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="disabled-input"
                    />
                  </div>

                  <div className="input-field">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="bs-btn bs-btn--primary" disabled={saving}>
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </button>
                    <button type="button" className="bs-btn bs-btn--ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SellerProfile;