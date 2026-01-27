"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import "./SellerDashboard.css";
import { FaShoppingCart, FaRupeeSign } from "react-icons/fa";
import { getSellerProfile, getSellerDashboard } from "../../api/seller";
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerDashboard = () => {
  const router = useRouter();

  // State Management
  const [sellerId, setSellerId] = useState(null);
  const [sellerName, setSellerName] = useState("Seller");
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isVerified, setIsVerified] = useState(false);

  /* =========================================
      ENCRYPTION HELPERS
  ========================================= */
  const secureGetItem = (key) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    try {
      return item ? atob(item) : null; // Decodes Base64 for internal use
    } catch (e) {
      return null;
    }
  };

  /* =========================================
      AUTHENTICATION CHECK
  ========================================= */
  useEffect(() => {
    // Reading the encrypted ID from storage
    const sid = secureGetItem("sellerId");
    if (!sid) {
      router.push("/sellerlogin");
    } else {
      setSellerId(sid);
    }
  }, [router]);

  /* =========================================
      DATA FETCHING
  ========================================= */
  useEffect(() => {
    if (!sellerId) return;

    const loadDashboardData = async () => {
      setLoading(true);

      try {
        // Fetch Profile Info
        const profileRes = await getSellerProfile(sellerId);

        // Handle potential encrypted payload from backend
        const data = profileRes.data?.payload
          ? JSON.parse(atob(profileRes.data.payload))
          : (profileRes.data || {});

        const verified = !!data.isVerified;
        setIsVerified(verified);

        const fetchedName = data.name || data.seller?.name || "Seller";
        setSellerName(fetchedName);
        if (verified) {
          const statsRes = await getSellerDashboard(sellerId);
          const stats = statsRes.data?.payload
            ? JSON.parse(atob(statsRes.data.payload))
            : (statsRes.data || {});

          setOrdersCount(stats.ordersCount || 0);
          setTotalEarnings(stats.totalEarnings || 0);
        }
      } catch (err) {
        console.error("Could not fetch seller name:", err);
        setSellerName("Seller");
      }

      try {
        // Fetch Stats
        const statsRes = await getSellerDashboard(sellerId);

        const stats = statsRes.data?.payload
          ? JSON.parse(atob(statsRes.data.payload))
          : (statsRes.data || {});

        setOrdersCount(stats.ordersCount || 0);
        setTotalEarnings(stats.totalEarnings || 0);
      } catch (err) {
        console.error("Stats Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [sellerId]);

  if (!isVerified) {
    return (
      <div className="verification-gate">
        <div className="verification-card">
          <div className="verification-icon-box">🛡️</div>
          <h2>Seller Verification Pending.</h2>
          <p>
            Welcome to the Core2Cover merchant network! To maintain our premium standards, 
            your seller account is currently under review. It Might Take 24-48 hours.
          </p>
          <div className="verification-status-pill">
            <span className="pulse-dot"></span>
            Status: Reviewing Documents
          </div>
          <p className="verification-subtext">
            Our team is verifying your business details. You will be notified via email 
            once you can start listing products and receiving orders.
          </p>
          <button className="gate-logout-btn" onClick={() => {
            localStorage.clear();
            router.push("/sellerlogin");
          }}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && <LoadingSpinner message="Initialising Dashboard..." />}

      <div className="dashboard-wrapper">
        <Sidebar />

        <main className="dashboard-main">
          {!loading && (
            <>
              <header className="dashboard-header">
                <h1 className="dashboard-title">Welcome back, {sellerName}</h1>
                <p className="dashboard-subtitle">Here is what is happening with your store today.</p>
              </header>

              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <div className="card-icon-bg">
                    <FaShoppingCart className="dashboard-icon" />
                  </div>
                  <div className="card-content">
                    <p className="dashboard-label">Orders Received</p>
                    <h2 className="dashboard-value">{ordersCount}</h2>
                  </div>
                </div>

                <div className="dashboard-card highlight">
                  <div className="card-icon-bg">
                    <FaRupeeSign className="dashboard-icon" />
                  </div>
                  <div className="card-content">
                    <p className="dashboard-label">Total Earnings</p>
                    <h2 className="dashboard-value">
                      ₹{totalEarnings.toLocaleString('en-IN')}
                    </h2>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default SellerDashboard;