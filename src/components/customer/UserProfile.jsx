"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import "./UserProfile.css";
import Navbar from "./Navbar";
import MyOrders from "./MyOrders";
import MyHiredDesigners from "./MyHiredDesigners";
import { getUserByEmail, updateUserProfile } from "../../api/user";
import { getClientHiredDesigners } from "../../api/designer";
import { FaStar } from "react-icons/fa";

const UserProfile = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [designers, setDesigners] = useState([]);

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

  const ratingStats = useMemo(() => {
    const feedback = designers.filter((d) => d.userRating);
    if (feedback.length === 0) return { avg: null, count: 0 };
    const total = feedback.reduce((sum, d) => sum + d.userRating.stars, 0);
    return {
      avg: (total / feedback.length).toFixed(1),
      count: feedback.length,
    };
  }, [designers]);

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
        setUser(userData);
        setDesigners(Array.isArray(designersRes.data) ? designersRes.data : []);
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    };

    if (effectiveEmail) {
      loadData();
    }
  }, [effectiveEmail, effectiveUserId, router, status]);

  const handleLogout = () => {
    if (status === "authenticated") {
      signOut({ callbackUrl: "/" });
    } else {
      localStorage.clear();
      router.push("/");
    }
  };

  // Directly updating the 'user' state which represents DB data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Sending current 'user' state directly to the DB
      const response = await updateUserProfile(effectiveEmail, {
        name: user.name,
        phone: user.phone,
        address: user.address,
      });

      const updatedUser = response.data || response;
      setUser(updatedUser);
      setIsEditing(false);
      alert("Profile updated successfully");

      if (status === "authenticated") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  if (status === "loading") return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="profile-page-wrapper">
        <div className="profile-header-section">
          <button onClick={() => router.back()} className="back-button">
            ← Back
          </button>
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
                  <input
                    type="text"
                    name="name"
                    value={user.name} // Using 'user' state directly
                    onChange={handleChange}
                    className="up-profile-input"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={user.phone} // Using 'user' state directly
                    onChange={handleChange}
                    className="up-profile-input"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    name="address"
                    value={user.address} // Using 'user' state directly
                    onChange={handleChange}
                    className="up-profile-input"
                    placeholder="Address"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={handleSave}
                      className="up-profile-button up-save"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="up-profile-button cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="user-info-display">
                    <h2>
                      {session?.user?.name || user.name || "User"}{" "}
                      {status === "authenticated" && (
                        <span className="verified-badge">✓</span>
                      )}
                    </h2>
                    <p className="user-email">
                      {session?.user?.email || user.email}
                    </p>
                    <div className="contact-info">
                      <p>
                        <strong>Phone:</strong> {user.phone || "—"}
                      </p>
                      <p>
                        <strong>Address:</strong> {user.address || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="profile-actions">
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

            <div className="profile-rating-summary-column">
              <div className="rating-summary-badge">
                <span className="summary-label">Client Reputation</span>
                {ratingStats.avg ? (
                  <div className="summary-stats">
                    <div className="summary-stars">
                      <span className="summary-score">{ratingStats.avg}</span>
                      <FaStar className="star-icon" />
                    </div>
                    <p className="summary-count">
                      Based on {ratingStats.count} Designer Reviews
                    </p>
                  </div>
                ) : (
                  <p className="no-rating-text">No designer feedback yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-tabs-container">
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            My Orders
          </button>
          <button
            className={`tab-btn ${activeTab === "designers" ? "active" : ""}`}
            onClick={() => setActiveTab("designers")}
          >
            Hired Designers
          </button>
        </div>

        <div className="tab-content-area">
          {activeTab === "orders" ? <MyOrders /> : <MyHiredDesigners />}
        </div>
      </div>
    </>
  );
};

export default UserProfile;