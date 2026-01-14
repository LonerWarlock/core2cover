"use client";

import React, { useEffect, useState, useCallback } from "react";
import "./SellerReturns.css";
import {
  getSellerReturns,
  approveReturn,
  rejectReturn,
} from "../../api/seller";
import Sidebar from "./Sidebar";
import MessageBox from "../ui/MessageBox";

/* =========================
   SAFE HELPERS
========================= */
const safeLower = (value, fallback = "pending") =>
  (value || fallback).toLowerCase();

/* =========================
   DERIVE STATUS (SOURCE OF TRUTH)
========================= */
const deriveReturnStatus = (r) => {
  const seller = (r.sellerApprovalStatus || "").toUpperCase();
  const admin = (r.adminApprovalStatus || "").toUpperCase();

  if (seller === "REJECTED" || admin === "REJECTED") return "REJECTED";
  if (seller === "APPROVED" && admin === "APPROVED") return "APPROVED";
  if (seller === "APPROVED") return "UNDER_REVIEW";

  return "REQUESTED";
};

export default function SellerReturns() {
  const [sellerId, setSellerId] = useState(null);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  /* 🔹 Modal states */
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReturnId, setSelectedReturnId] = useState(null);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
      INITIALISE & FETCH
  ========================= */
  const fetchReturns = useCallback(async (sid) => {
    try {
      setLoading(true);
      const res = await getSellerReturns(sid);
      setReturns(res.data.returns || []);
    } catch (err) {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sid = localStorage.getItem("sellerId");
      setSellerId(sid);
      if (sid) fetchReturns(sid);
    }
  }, [fetchReturns]);

  /* =========================
      APPROVE FLOW
  ======================== */
  const openApproveModal = (id) => {
    setSelectedReturnId(id);
    setApproveModalOpen(true);
  };

  const handleApprove = async () => {
    const id = selectedReturnId;
    setLoadingId(id);
    setApproveModalOpen(false);
    
    try {
      await approveReturn(id);
      setReturns((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, sellerApprovalStatus: "APPROVED" } : r
        )
      );
      triggerMsg("Return approved successfully");
    } catch (err) {
      triggerMsg(err?.response?.data?.message || "Failed to approve return", "error");
    } finally {
      setLoadingId(null);
    }
  };

  /* =========================
      REJECT FLOW
  ========================= */
  const openRejectModal = (id) => {
    setSelectedReturnId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      triggerMsg("Please provide a rejection reason", "error");
      return;
    }

    const id = selectedReturnId;
    setLoadingId(id);
    setRejectModalOpen(false);

    try {
      await rejectReturn(id, rejectReason);
      setReturns((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, sellerApprovalStatus: "REJECTED" } : r
        )
      );
      triggerMsg("Return rejected", "success");
    } catch (err) {
      triggerMsg(err?.response?.data?.message || "Failed to reject return", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="ms-root">
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}
      <Sidebar />

      <div className="seller-returns-page">
        <h2 className="page-title">Return Requests</h2>

        {loading ? (
          <p className="empty-text">Loading requests...</p>
        ) : returns.length === 0 ? (
          <p className="empty-text">No return requests found for your store.</p>
        ) : (
          <div className="returns-grid">
            {returns.map((r) => {
              const status = deriveReturnStatus(r);

              return (
                <div key={r.id} className="return-card">
                  <div className="card-header">
                    <h3>{r.productName}</h3>
                    <span className={`status-pill ${safeLower(status)}`}>
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="card-body">
                    <p><strong>Customer:</strong> {r.user?.name || "N/A"}</p>
                    <p><strong>Email:</strong> {r.user?.email || "N/A"}</p>
                    <p><strong>Reason:</strong> {r.reason}</p>

                    {r.images?.length > 0 && (
                      <div className="return-images">
                        {r.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.startsWith('http') ? img : `http://localhost:3000${img}`}
                            alt="Return proof"
                            className="return-thumb"
                          />
                        ))}
                      </div>
                    )}

                    <p><strong>Refund Amount:</strong> ₹{r.refundAmount || 0}</p>
                    <p className="date">
                      Requested on {new Date(r.requestedAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>

                  {status === "REQUESTED" && (
                    <div className="card-actions dual">
                      <button
                        className="approve-btn"
                        disabled={loadingId === r.id}
                        onClick={() => openApproveModal(r.id)}
                      >
                        {loadingId === r.id ? "Processing..." : "Approve"}
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => openRejectModal(r.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {approveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Approve Return?</h3>
            <p>Are you sure you want to approve this return request? This will be sent for admin finalisation.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setApproveModalOpen(false)}>
                Cancel
              </button>
              {/* Added primary action button below */}
              <button className="confirm-reject-btn" style={{ background: "#6b7c5c" }} onClick={handleApprove}>
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Reject Return Request</h3>
            <p>Please provide a reason for rejecting this return to the customer.</p>

            <textarea
              placeholder="e.g. Item returned in damaged condition..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </button>
              <button className="confirm-reject-btn" onClick={handleReject}>
                Reject Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}