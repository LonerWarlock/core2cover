import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerProfile.css";
import Sidebar from "./Sidebar";
import { getSellerProfile, updateSellerProfile } from "../../api/seller";


const SellerProfile = () => {
  const navigate = useNavigate();
  const sellerId = Number(localStorage.getItem("sellerId"));

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     FETCH SELLER PROFILE
  ========================= */
  useEffect(() => {
    if (!sellerId || isNaN(sellerId)) {
      navigate("/sellerlogin");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await getSellerProfile(sellerId);

        setProfile(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
        });
      } catch (err) {
        alert("Failed to load profile");
        localStorage.removeItem("sellerId");
        navigate("/sellerlogin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [sellerId, navigate]);


  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Name and phone are required");
      return;
    }

    setSaving(true);

    try {
      const res = await updateSellerProfile(sellerId, {
        name: formData.name,
        phone: formData.phone,
      });

      setProfile((prev) => ({
        ...prev,
        name: res.data.seller.name,
        phone: res.data.seller.phone,
      }));

      setIsEditing(false);
      alert("Profile updated successfully ✅");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("sellerId");
    window.dispatchEvent(new Event("storage"));
    navigate("/sellerlogin");
  };


  if (loading) {
    return (
      <div className="bs-layout-root">
        <Sidebar />
        <div className="bs-profile-shell">
          <h2>Loading profile…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bs-layout-root">
      <Sidebar />
      <div className="bs-profile-shell">
        <h1 className="bs-heading">Seller Profile</h1>

        {!isEditing ? (
          <div className="bs-card">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Location:</strong> {profile.location}</p>

            <button className="bs-btn bs-btn--primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button className="bs-btn bs-btn--ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <form
            className="bs-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {["name", "email", "phone"].map((field) => (
              <input
                key={field}
                name={field}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                disabled={field === "email"}
              />
            ))}

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
