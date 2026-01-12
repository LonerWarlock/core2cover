"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./SellerProfile.css";
import Sidebar from "./Sidebar";
import { getSellerProfile, updateSellerProfile } from "../../api/seller";
import MessageBox from "../ui/MessageBox";

const SellerProfile = () => {
  const router = useRouter();
  const [sellerId, setSellerId] = useState(null);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
      INITIALISE & AUTH CHECK
  ========================= */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sid = localStorage.getItem("sellerId");
      if (!sid || isNaN(Number(sid))) {
        router.push("/sellerlogin");
      } else {
        setSellerId(Number(sid));
      }
    }
  }, [router]);

  /* =========================
      FETCH SELLER PROFILE
  ========================= */
  useEffect(() => {
    if (!sellerId) return;

    const loadProfile = async () => {
      try {
        const res = await getSellerProfile(sellerId);
        const data = res.data || res; // Tolerant to API structure

        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        triggerMsg("Failed to load profile", "error");
        localStorage.removeItem("sellerId");
        router.replace("/sellerlogin");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [sellerId, router]);

  /* =========================
      SAVE PROFILE
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

      // Optimistically update or use response data
      const updatedSeller = res.data?.seller || res.data || res;
      
      setProfile((prev) => ({
        ...prev,
        name: updatedSeller.name,
        phone: updatedSeller.phone,
      }));

      setIsEditing(false);
      triggerMsg("Profile updated successfully ✅", "success");
    } catch (err) {
      triggerMsg(
        err?.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sellerId");
    window.dispatchEvent(new Event("storage"));
    router.push("/sellerlogin");
  };

  if (loading) {
    return (
      <div className="bs-layout-root">
        <Sidebar />
        <div className="bs-profile-shell">
          <div className="loading-container">
            <h2>Initialising profile…</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
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

        {!isEditing ? (
          <div className="bs-card profile-view-card">
            <div className="profile-info-group">
              <p><strong>Business Name:</strong> {profile.name}</p>
              <p><strong>Login Email:</strong> {profile.email}</p>
              <p><strong>Contact Number:</strong> {profile.phone}</p>
              <p><strong>Primary Location:</strong> {profile.location || "Not specified"}</p>
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
            className="bs-card bs-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="input-field">
              <label>Full Name / Business Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="input-field">
              <label>Email Address (Immutable)</label>
              <input
                name="email"
                value={formData.email}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="input-field">
              <label>Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="bs-btn bs-btn--primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="bs-btn bs-btn--ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;