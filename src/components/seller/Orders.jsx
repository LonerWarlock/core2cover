// File: src/components/SupplierOrders.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./Orders.css";
import {
  getSellerOrders,
  updateSellerOrderStatus,
} from "../../api/seller";

/**
 * Robust Seller Orders UI
 * - tolerant to backend field-name variations
 * - safe optimistic updates with rollback
 * - better logging for debugging
 */

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [deliveringAll, setDeliveringAll] = useState(false);
  const sellerId = localStorage.getItem("sellerId");

  /* =========================
     HELP: Normalizers
  ========================= */
  const normalizeOrder = (o) => {
    // pick id that is likely the order-item id used for status updates
    const orderItemId = o.orderItemId ?? o.id ?? o.order_item_id ?? null;

    // pick status
    const status = o.status ?? o.orderStatus ?? o.order_status ?? "pending";

    // pick material label
    const material = o.material ?? o.materialName ?? o.productName ?? o.name ?? "Item";

    // pick quantity
    const quantity = o.quantity ?? o.trips ?? o.qty ?? 1;

    // pick customer / site
    const customer = o.customer ?? o.customerName ?? o.userName ?? o.customer_email ?? "-";

    // pick time
    const time = o.time ?? o.createdAt ?? o.created_at ?? o.orderTime ?? null;

    // site location
    const siteLocation = o.siteLocation ?? o.site_location ?? o.deliveryAddress ?? "";

    return {
      // keep original
      ...o,
      _orderItemId: orderItemId,
      _status: status,
      _material: material,
      _quantity: quantity,
      _customer: customer,
      _time: time,
      _siteLocation: siteLocation,
    };
  };

  /* =========================
     FETCH SELLER ORDERS
  ========================= */
  useEffect(() => {
    if (!sellerId) return;

    const loadOrders = async () => {
      try {
        const res = await getSellerOrders(sellerId);
        const data = Array.isArray(res.data) ? res.data : [];

        // normalize each order to use stable internal fields
        const normalized = data.map(normalizeOrder);

        setOrders(normalized);
      } catch (err) {
        console.error("LOAD SELLER ORDERS ERROR:", err);
        alert("Failed to load orders (check console).");
      }
    };

    loadOrders();
  }, [sellerId]);

  /* =========================
     Helper: updateStatus with rollback
  ========================= */
  const updateStatus = async (orderItemId, newStatus) => {
    if (!orderItemId) {
      console.error("updateStatus called without an orderItemId", orderItemId);
      return;
    }

    // optimistic UI change: store prev
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
      // success: nothing else to do (UI already updated)
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      alert("Failed to update order status (server error).");
      // rollback
      setOrders(prev);
    }
  };

  /* =========================
     ACCEPT ALL PENDING
  ========================= */
  const confirmAllOrders = async () => {
    const pending = orders.filter((o) => o._status === "pending");
    if (pending.length === 0) return;
    if (!window.confirm(`Accept all ${pending.length} pending orders?`)) return;

    setConfirmingAll(true);
    const prev = orders;

    // optimistic update
    setOrders((prevList) =>
      prevList.map((o) => (o._status === "pending" ? { ...o, _status: "confirmed" } : o))
    );

    try {
      await Promise.all(
        pending.map((order) => updateSellerOrderStatus(order._orderItemId ?? order.id, "confirmed"))
      );
    } catch (err) {
      console.error("CONFIRM ALL ERROR:", err);
      alert("Failed to accept all (check console).");
      setOrders(prev); // rollback
    } finally {
      setConfirmingAll(false);
    }
  };

  /* =========================
     MARK ALL AS DELIVERED
  ========================= */
  const deliverAllOrders = async () => {
    const confirmed = orders.filter((o) => o._status === "confirmed");
    if (confirmed.length === 0) return;
    if (!window.confirm(`Mark all ${confirmed.length} confirmed orders as delivered?`)) return;

    setDeliveringAll(true);
    const prev = orders;

    setOrders((prevList) =>
      prevList.map((o) => (o._status === "confirmed" ? { ...o, _status: "fulfilled" } : o))
    );

    try {
      await Promise.all(
        confirmed.map((order) => updateSellerOrderStatus(order._orderItemId ?? order.id, "fulfilled"))
      );
    } catch (err) {
      console.error("DELIVER ALL ERROR:", err);
      alert("Failed to mark all as delivered (check console).");
      setOrders(prev);
    } finally {
      setDeliveringAll(false);
    }
  };

  /* =========================
     HELPERS
  ========================= */
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
      console.error("COPY LOCATION ERROR:", err);
      alert("Failed to copy location (check clipboard permissions).");
    }
  };

  const hasPendingOrders = orders.some((o) => o._status === "pending");
  const hasConfirmedOrders = orders.some((o) => o._status === "confirmed");

  /* =========================
     UI
  ========================= */
  return (
    <div className="orders-layout">
      <Sidebar />
      <div className="notification-scrollable" />

      <div className="orders-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
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

        {orders.length === 0 ? (
          <p className="no-orders">No orders received yet.</p>
        ) : (
          <ul className="orders-list">
            {orders.map((order) => (
              <li key={order._orderItemId ?? order.id} className={`order-item ${order._status}`}>
                <div className="order-top">
                  <div className="order-header">
                    <strong>{order._material}</strong>  <span>Quantity - {order._quantity}</span>
                  </div>

                  <div className="order-meta">
                    <span className="meta-item">
                      Customer: <strong>{order._customer}</strong>
                    </span>

                    <span className="meta-item">
                      Order Placed:{" "}
                      <strong>
                        {order._time ? new Date(order._time).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-left">
                    <div className="order-status">
                      Status: <span className={`status-label ${order._status}`}>{order._status}</span>
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
                        <button
                          onClick={() => updateStatus(order._orderItemId ?? order.id, "confirmed")}
                          className="confirm-btn"
                        >
                          Accept Order
                        </button>
                        <button
                          onClick={() => updateStatus(order._orderItemId ?? order.id, "rejected")}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order._status === "confirmed" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(order._orderItemId ?? order.id, "out_for_delivery")
                          }
                          className="confirm-btn"
                        >
                          Out For Delivery
                        </button>
                      </>
                    )}

                    {order._status === "out_for_delivery" && (
                      <button
                        onClick={() =>
                          updateStatus(order._orderItemId ?? order.id, "fulfilled")
                        }
                        className="fulfill-btn"
                      >
                        ✅ Mark as Delivered
                      </button>
                    )}

                    {order._status === "fulfilled" && <span className="badge fulfilled">Delivered</span>}
                    {order._status === "rejected" && <span className="badge rejected">Rejected</span>}

                    {order._status === "cancelled" && (
                      <span className="badge rejected">Cancelled by customer</span>
                    )}

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
