"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import "./UserProfile.css";
import Navbar from "./Navbar";
import MyOrders from "./MyOrders";
import MyHiredDesigners from "./MyHiredDesigners";
import { getUserByEmail, updateUserProfile } from "../../api/user";
import { getClientHiredDesigners } from "../../api/designer";
import MessageBox from "../ui/MessageBox";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const libraries = ["places", "maps"];

const UserProfile = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("orders");
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  
  // Google Maps Loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const autocompleteRef = useRef(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const effectiveEmail = useMemo(() => {
    if (status === "authenticated") return session?.user?.email;
    if (typeof window !== "undefined") return localStorage.getItem("userEmail");
    return null;
  }, [session, status]);

  const effectiveUserId = useMemo(() => {
    if (status === "authenticated") return session?.user?.id;
    if (typeof window !== "undefined") return localStorage.getItem("userId");
    return null;
  }, [session, status]);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!effectiveEmail && status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [userRes, designersRes] = await Promise.all([
          getUserByEmail(effectiveEmail),
          getClientHiredDesigners({ userId: effectiveUserId }),
        ]);

        const userData = userRes.data || userRes;
        
        setUser({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });

        // Automatically prompt Google users to complete profile if data is missing
        if (status === "authenticated" && (!userData.phone || !userData.address)) {
          setIsEditing(true);
          triggerMsg("Please complete your profile details.", "info");
        }

        setDesigners(Array.isArray(designersRes.data) ? designersRes.data : []);
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    };

    if (effectiveEmail) {
      loadData();
    }
  }, [effectiveEmail, effectiveUserId, router, status]);

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || place.name;
      setUser((prev) => ({ ...prev, address }));
    }
  };

const handleLogout = async () => {
  // 1. Clear manual login data
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("sellerId");
  localStorage.removeItem("designerId");

  // 2. Clear NextAuth session (Google)
  await signOut({ callbackUrl: "/login" });
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user.phone || !user.address) {
      triggerMsg("Phone and Address are required.", "error");
      return;
    }

    try {
      const response = await updateUserProfile(effectiveEmail, {
        name: user.name,
        phone: user.phone,
        address: user.address,
      });

      const updatedUser = response.data || response;

      setUser({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
      });

      setIsEditing(false);
      triggerMsg("Profile updated successfully", "success");

      if (status === "authenticated") {
        router.refresh();
      }
    } catch (err) {
      triggerMsg(err.response?.data?.message || "Failed to update profile", "error");
    }
  };

  // 2. APPLY THE LOADING SPINNER DURING SESSION LOADING
  if (status === "loading") return <LoadingSpinner message="Securing your profile..." />;

  return (
    <>
      <Navbar />
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}
      <div className="profile-page-wrapper">
          <button onClick={() => router.back()} className="back-button">
            ← Back
          </button>
        <div className="profile-header-section">
          <h1 className="main-profile-title">My Account</h1>
        </div>

        <div className="profile-info-card">
          <div className="profile-card-content">
            <div className="profile-details-column">
              {session?.user?.image && (
                <div className="profile-image-container">
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="user-profile-img"
                    unoptimized={true}
                  />
                </div>
              )}

              {isEditing ? (
                <div className="edit-form">
                  <h3>Complete Your Profile</h3>
                  <div className="input-group">
                    <label>Name</label>
                    <input type="text" name="name" value={user.name || ""} onChange={handleChange} className="up-profile-input" />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" value={user.phone || ""} onChange={handleChange} className="up-profile-input" placeholder="+91 00000 00000" />
                  </div>
                  
                  <div className="input-group">
                    <label>Address (Your Location)</label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={handlePlaceSelect}
                      >
                        <input
                          type="text"
                          name="address"
                          value={user.address || ""}
                          onChange={handleChange}
                          className="up-profile-input"
                          placeholder="Search for your address..."
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        name="address"
                        value={user.address || ""}
                        onChange={handleChange}
                        className="up-profile-input"
                        placeholder="Loading maps..."
                      />
                    )}
                  </div>

                  <div className="edit-actions">
                    <button onClick={handleSave} className="up-profile-button up-save">Save Profile</button>
                    {user.phone && user.address && (
                       <button onClick={() => setIsEditing(false)} className="up-profile-button cancel">Cancel</button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="user-info-display">
                    <h2>
                      {session?.user?.name || user.name || "User"}{" "}
                      {status === "authenticated" && <span className="verified-badge">✓</span>}
                    </h2>
                    <p className="user-email">{session?.user?.email || user.email}</p>
                    <div className="contact-info">
                      <p><strong>Phone:</strong> {user.phone || "—"}</p>
                      <p><strong>Address:</strong> {user.address || "—"}</p>
                    </div>
                  </div>
                  <div className="profile-actions">
                    <button onClick={() => setIsEditing(true)} className="profile-button edit">Edit Profile</button>
                    <button onClick={handleLogout} className="profile-button logout">Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-tabs-container">
          <button className={`tab-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>My Orders</button>
          <button className={`tab-btn ${activeTab === "designers" ? "active" : ""}`} onClick={() => setActiveTab("designers")}>Hired Designers</button>
        </div>

        <div className="tab-content-area">
          {activeTab === "orders" ? <MyOrders /> : <MyHiredDesigners />}
        </div>
      </div>
    </>
  );
};

export default UserProfile;