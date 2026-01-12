"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // CHANGED
import Sidebar from "./Sidebar";
import "./SellerDashboard.css";
import { FaShoppingCart, FaRupeeSign } from "react-icons/fa";
import { getSellerProfile, getSellerOrders, getSellerDashboard } from "../../api/seller";

const SellerDashboard = () => {
  const router = useRouter();
  const [sellerId, setSellerId] = useState(null);
  
  const [sellerName, setSellerName] = useState("Seller");
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hydration safe auth check
  useEffect(() => {
    const sid = localStorage.getItem("sellerId");
    if (!sid) {
      router.push("/sellerdashboard");
    } else {
      setSellerId(sid);
    }
  }, [router]);

  useEffect(() => {
    if (!sellerId) return;

    const loadData = async () => {
      // 1. Profile
      try {
        const res = await getSellerProfile(sellerId);
        setSellerName(res.data.name || "Seller");
      } catch { setSellerName("Seller"); }

      // 2. Stats
      try {
        const res = await getSellerDashboard(sellerId);
        const data = res?.data || {};
        setOrdersCount(data.ordersCount ?? 0);
        setTotalEarnings(data.totalEarnings ?? 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Fallback
        try {
          const res2 = await getSellerOrders(sellerId);
          const orders = Array.isArray(res2.data) ? res2.data : [];
          setOrdersCount(orders.length);
          const earnings = orders
            .filter((o) => (o.status ?? o._status ?? "").toString() === "fulfilled")
            .reduce((sum, o) => sum + Number(o.totalAmount ?? o.totalPrice ?? 0), 0);
          setTotalEarnings(earnings);
        } catch { setTotalEarnings(0); }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-main"><h2>Loading dashboard…</h2></div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-main">
        <h1 className="dashboard-title">Welcome, {sellerName}</h1>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <FaShoppingCart className="dashboard-icon" />
            <p className="dashboard-label">Orders Received</p>
            <h2 className="dashboard-value">{ordersCount}</h2>
          </div>
          <div className="dashboard-card">
            <FaRupeeSign className="dashboard-icon" />
            <p className="dashboard-label">Total Earnings</p>
            <h2 className="dashboard-value">₹{totalEarnings.toLocaleString()}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SellerDashboard;