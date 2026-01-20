"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./Orders.css";
import {
  getSellerOrders,
  updateSellerOrderStatus,
} from "../../api/seller";
import MessageBox from "../ui/MessageBox";
import { FaTruckLoading, FaRulerCombined, FaUser, FaClock } from "react-icons/fa";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [deliveringAll, setDeliveringAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  const [sellerId, setSellerId] = useState(null);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
      Normalizers (Updated for Logistics)
  ========================= */
  const normalizeOrder = (o) => {
    const orderItemId = o.orderItemId ?? o.id ?? o.order_item_id ?? null;
    const status = o.status ?? o.orderStatus ?? o.order_status ?? "pending";
    const material = o.material ?? o.materialName ?? o.productName ?? o.name ?? "Item";
    
    // Quantity represents the number of Units (Sheets/Pcs)
    const quantity = o.quantity ?? o.qty ?? 1;
    // Trips represents the logistics requirement calculated at checkout
    const trips = o.trips ?? 1;
    const unit = o.unit || "pcs";
    
    const customer = o.customer ?? o.customerName ?? o.userName ?? o.customer_email ?? "-";
    const time = o.time ?? o.createdAt ?? o.created_at ?? o.orderTime ?? null;
    const siteLocation = o.siteLocation ?? o.site_location ?? o.deliveryAddress ?? "";

    return {
      ...o,
      _orderItemId: orderItemId,
      _status: status,
      _material: material,
      _quantity: quantity,
      _trips: trips,
      _unit: unit,
      _customer: customer,
      _time: time,
      _siteLocation: siteLocation,
    };
  };

  /* =========================
      INITIALISE & FETCH
  ========================= */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSellerId(localStorage.getItem("sellerId"));
    }
  }, []);

  useEffect(() => {
    if (!sellerId) return;

    const loadOrders = async () => {
      try {
        const res = await getSellerOrders(sellerId);
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map(normalizeOrder);
        setOrders(normalized);
      } catch (err) {
        console.error("LOAD SELLER ORDERS ERROR:", err);
        triggerMsg("Failed to load orders", "error");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [sellerId]);

  /* =========================
      Status Updates
  ========================= */
  const updateStatus = async (orderItemId, newStatus) => {
    if (!orderItemId) return;

    const prev = orders;
    setOrders((prevList) =>
      prevList.map((o) =>
        (o._orderItemId === orderItemId || o.id === orderItemId)
          ? { ...o, _status: newStatus }
          : o
      )
    );

    try {
      await updateSellerOrderStatus(orderItemId, newStatus);
      triggerMsg(`Order updated to ${newStatus.replace(/_/g, " ")}`, "success");
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      triggerMsg("Failed to update order status", "error");
      setOrders(prev);
    }
  };

  const confirmAllOrders = async () => {
    const pending = orders.filter((o) => o._status === "pending");
    if (pending.length === 0) return;
    if (!window.confirm(`Accept all ${pending.length} pending orders?`)) return;

    setConfirmingAll(true);
    const prev = orders;

    setOrders((prevList) =>
      prevList.map((o) => (o._status === "pending" ? { ...o, _status: "confirmed" } : o))
    );

    try {
      await Promise.all(
        pending.map((order) => updateSellerOrderStatus(order._orderItemId ?? order.id, "confirmed"))
      );
      triggerMsg("All orders accepted", "success");
    } catch (err) {
      setOrders(prev);
      triggerMsg("Failed to accept all orders", "error");
    } finally {
      setConfirmingAll(false);
    }
  };

  const deliverAllOrders = async () => {
    const confirmed = orders.filter((o) => o._status === "confirmed")
                            .concat(orders.filter(o => o._status === "out_for_delivery"));
    if (confirmed.length === 0) return;
    if (!window.confirm(`Mark all active orders as delivered?`)) return;

    setDeliveringAll(true);
    const prev = orders;

    setOrders((prevList) =>
      prevList.map((o) => (["confirmed", "out_for_delivery"].includes(o._status) ? { ...o, _status: "fulfilled" } : o))
    );

    try {
      await Promise.all(
        confirmed.map((order) => updateSellerOrderStatus(order._orderItemId ?? order.id, "fulfilled"))
      );
      triggerMsg("All orders marked as delivered", "success");
    } catch (err) {
      setOrders(prev);
      triggerMsg("Failed to mark delivered", "error");
    } finally {
      setDeliveringAll(false);
    }
  };

  const openMaps = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLocation = async (location, id) => {
    try {
      await navigator.clipboard.writeText(location);
      setOrders((prev) => prev.map((o) => (o._orderItemId === id || o.id === id ? { ...o, copied: true } : o)));
      setTimeout(() => {
        setOrders((prev) => prev.map((o) => (o._orderItemId === id || o.id === id ? { ...o, copied: false } : o)));
      }, 1200);
    } catch (err) {
      triggerMsg("Failed to copy location", "error");
    }
  };

  const hasPendingOrders = orders.some((o) => o._status === "pending");
  const hasConfirmedOrders = orders.some((o) => ["confirmed", "out_for_delivery"].includes(o._status));

  return (
    <div className="orders-layout">
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}
      <Sidebar />

      <div className="orders-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <h1>Customer Orders</h1>

          <div style={{ display: "flex", gap: 8 }}>
            {hasPendingOrders && (
              <button className="confirm-btn" onClick={confirmAllOrders} disabled={confirmingAll}>
                {confirmingAll ? "Accepting..." : "Accept All"}
              </button>
            )}
            {hasConfirmedOrders && (
              <button className="fulfill-btn" onClick={deliverAllOrders} disabled={deliveringAll}>
                {deliveringAll ? "Delivering..." : "Mark All Delivered"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="no-orders">No orders received yet.</p>
        ) : (
          <ul className="orders-list">
            {orders.map((order) => (
              <li key={order._orderItemId ?? order.id} className={`order-item ${order._status}`}>
                <div className="order-top">
                  <div className="order-header">
                    <div className="header-main">
                        <strong>{order._material}</strong>
                        <span className="unit-badge">{order._unit}</span>
                    </div>
                    <div className="logistics-summary">
                        <span className="log-item"><FaRulerCombined /> Qty: {order._quantity}</span>
                        <span className="log-item"><FaTruckLoading /> Trips: {order._trips}</span>
                    </div>
                  </div>
                  <div className="order-meta">
                    <span className="meta-item"><FaUser /> <strong>{order._customer}</strong></span>
                    <span className="meta-item"><FaClock /> <strong>{order._time ? new Date(order._time).toLocaleString("en-IN") : "—"}</strong></span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-left">
                    <div className="order-status">
                      Status: <span className={`status-label ${order._status}`}>{order._status.replace(/_/g, " ")}</span>
                    </div>
                    <div className="site-row">
                      <button type="button" className="site-button" onClick={() => openMaps(order._siteLocation)}>
                        📍 {order._siteLocation || "View location"}
                      </button>
                      <button type="button" className="site-copy" onClick={() => copyLocation(order._siteLocation, order._orderItemId ?? order.id)}>
                        {order.copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="order-actions">
                    {order._status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(order._orderItemId ?? order.id, "confirmed")} className="confirm-btn">Accept</button>
                        <button onClick={() => updateStatus(order._orderItemId ?? order.id, "rejected")} className="reject-btn">Reject</button>
                      </>
                    )}
                    {order._status === "confirmed" && (
                      <button onClick={() => updateStatus(order._orderItemId ?? order.id, "out_for_delivery")} className="confirm-btn">Out For Delivery</button>
                    )}
                    {order._status === "out_for_delivery" && (
                      <button onClick={() => updateStatus(order._orderItemId ?? order.id, "fulfilled")} className="fulfill-btn"> Mark Delivered</button>
                    )}
                    {order._status === "fulfilled" && <span className="badge fulfilled">Delivered</span>}
                    {order._status === "rejected" && <span className="badge rejected">Rejected</span>}
                    {order._status === "cancelled" && <span className="badge rejected">Cancelled</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;