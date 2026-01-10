"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./UserProfile.css";
import Navbar from "./Navbar";
import MyOrders from "./MyOrders";
import { getUserByEmail, updateUserProfile } from "../../api/user";

const UserProfile = () => {
  const router = useRouter();
  
  // Initialize state safely for SSR
  const [userEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userEmail");
    }
    return null;
  });

  /* ==============================
     LOGOUT & NAVIGATION
  ============================== */
  const handleLogout = () => {
    localStorage.clear();
    alert("You have been logged out.");
    router.push("/");
  };

  const handleBack = () => {
    router.back();
  };

  /* ==============================
     USER STATE
  ============================== */
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  /* ==============================
     FETCH USER FROM DB
  ============================== */
  useEffect(() => {
    if (userEmail === null) return; // Wait for client-side load

    if (!userEmail) {
      router.push("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const res = await getUserByEmail(userEmail);
        setUser(res.data);
        setFormData(res.data);
      } catch {
        alert("Failed to load user profile");
      }
    };

    loadUser();
  }, [userEmail, router]);


  /* ==============================
     HANDLERS
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(userEmail, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      setUser(formData);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      alert(err.message || "Failed to update profile");
    }
  };


  return (
    <>
      <Navbar />
      <div className="profile">
        <div className="back-button-container">
          <button onClick={handleBack} className="back-button">
            ← Back
          </button>
        </div>

        <div className="profile-container">
          <div className="profile-card">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="up-profile-input"
                  placeholder="Enter name"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="up-profile-input"
                  disabled
                />

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="up-profile-input"
                  placeholder="Enter phone"
                />

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="up-profile-input"
                  placeholder="Enter address"
                />

                <button
                  onClick={handleSave}
                  className="up-profile-button up-save"
                >
                  Save
                </button>
              </>
            ) : (
            <>
              <div className="user-info">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || "—"}</p>
                <p><strong>Address:</strong> {user.address || "—"}</p>
              </div>

              <hr />

              <div className="button-group">
                <button
                  onClick={() => setIsEditing(true)}
                  className="profile-button edit"
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="profile-button logout"
                >
                  Logout
                </button>
              </div>
            </>
            )}
          </div>
        </div>
        <hr />

        {/* Orders */}
        <div className="orders">
          <MyOrders />
        </div>
      </div>
    </>
  );
};

export default UserProfile;