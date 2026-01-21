"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import "./SellerDashboard.css";
import { FaShoppingCart, FaRupeeSign } from "react-icons/fa";
import { getSellerProfile, getSellerDashboard } from "../../api/seller";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerDashboard = () => {
  const router = useRouter();

  // 1. State Management
  const [sellerId, setSellerId] = useState(null);
  const [sellerName, setSellerName] = useState("Seller");
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =========================================
      2. AUTHENTICATION CHECK
  ========================================= */
  useEffect(() => {
    const sid = localStorage.getItem("sellerId");
    if (!sid) {
      // Corrected: Redirect to login if not authenticated
      router.push("/sellerlogin");
    } else {
      setSellerId(sid);
    }
  }, [router]);

  /* =========================================
      3. DATA FETCHING (Hook Placement)
  ========================================= */
  useEffect(() => {
    // Only run if we have a sellerId
    if (!sellerId) return;

    const loadDashboardData = async () => {
      setLoading(true);

      try {
        // Fetch Profile Info
        const profileRes = await getSellerProfile(sellerId);
        // Note: Check if your backend sends 'name' or 'seller.name'
        const fetchedName = profileRes.data?.name || profileRes.data?.seller?.name || "Seller";
        setSellerName(fetchedName);
      } catch (err) {
        console.error("Could not fetch seller name:", err);
        setSellerName("Seller");
      }

      try {
        // Fetch Stats
        const statsRes = await getSellerDashboard(sellerId);
        setOrdersCount(statsRes.data?.ordersCount || 0);
        setTotalEarnings(statsRes.data?.totalEarnings || 0);
      } catch (err) {
        console.error("Stats Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [sellerId]); // This runs whenever sellerId is set

  /* =========================================
      4. RENDER LOGIC
  ========================================= */
  return (
    <>
      {/* 2. PLACED AT THE TOP LEVEL TO ENSURE MAXIMUM VISIBILITY */}
      {loading && <LoadingSpinner message="Initialising Dashboard..." />}

      <div className="dashboard-wrapper">
        <Sidebar />

        <main className="dashboard-main">
          {/* Dashboard content only shows its full styling when loading is complete */}
          {!loading && (
            <>
              <header className="dashboard-header">
                <h1 className="dashboard-title">Welcome back, {sellerName}</h1>
                <p className="dashboard-subtitle">Here is what is happening with your store today.</p>
              </header>

              <div className="dashboard-cards">
                {/* Orders Card */}
                <div className="dashboard-card">
                  <div className="card-icon-bg">
                    <FaShoppingCart className="dashboard-icon" />
                  </div>
                  <div className="card-content">
                    <p className="dashboard-label">Orders Received</p>
                    <h2 className="dashboard-value">{ordersCount}</h2>
                  </div>
                </div>

                {/* Earnings Card */}
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