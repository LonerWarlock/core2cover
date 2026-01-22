"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import "./SellerReturns.css";
import {
  getSellerReturns,
  approveReturn,
  rejectReturn,
} from "../../api/seller";
import Sidebar from "./Sidebar";
import MessageBox from "../ui/MessageBox";
import { FaTimes, FaExpand } from "react-icons/fa"; 
import LoadingSpinner from "../ui/LoadingSpinner";

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

/* ---------------------------
    Lightbox Zoom & Drag Component
    --------------------------- */
function LightboxImage({ src }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const lastPointer = useRef({ active: false, x: 0, y: 0 });

    const transformStyle = {
        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        touchAction: "none",
        cursor: scale > 1 ? "grab" : "auto",
        willChange: "transform",
        transition: lastPointer.current.active ? "none" : "transform 0.1s ease-out"
    };

    const clamp = (val, a, b) => Math.max(a, Math.min(b, val));

    const getBounds = useCallback((s = scale) => {
        const c = containerRef.current;
        if (!c) return { maxX: 0, maxY: 0 };
        return { 
            maxX: Math.max(0, (c.clientWidth * s - c.clientWidth) / 2), 
            maxY: Math.max(0, (c.clientHeight * s - c.clientHeight) / 2) 
        };
    }, [scale]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onPointerDown = (e) => {
            if (scale <= 1) return;
            container.setPointerCapture(e.pointerId);
            lastPointer.current = { active: true, id: e.pointerId, x: e.clientX, y: e.clientY };
        };

        const onPointerMove = (e) => {
            if (!lastPointer.current.active || lastPointer.current.id !== e.pointerId) return;
            const dx = e.clientX - lastPointer.current.x;
            const dy = e.clientY - lastPointer.current.y;
            lastPointer.current.x = e.clientX;
            lastPointer.current.y = e.clientY;

            setTranslate(prev => {
                const { maxX, maxY } = getBounds();
                return { 
                    x: clamp(prev.x + dx, -maxX, maxX), 
                    y: clamp(prev.y + dy, -maxY, maxY) 
                };
            });
        };

        const onPointerUp = (e) => {
            lastPointer.current.active = false;
            try { container.releasePointerCapture(e.pointerId); } catch {}
        };

        container.addEventListener("pointerdown", onPointerDown);
        container.addEventListener("pointermove", onPointerMove);
        container.addEventListener("pointerup", onPointerUp);
        return () => {
            container.removeEventListener("pointerdown", onPointerDown);
            container.removeEventListener("pointermove", onPointerMove);
            container.removeEventListener("pointerup", onPointerUp);
        };
    }, [getBounds, scale]);

    const onWheel = (e) => {
        e.preventDefault();
        const newScale = clamp(scale * (e.deltaY < 0 ? 1.15 : 0.85), 1, 5);
        setScale(newScale);
        if (newScale === 1) setTranslate({ x: 0, y: 0 });
    };

    return (
        <div 
            ref={containerRef} 
            className="lightbox-zoom-container" 
            style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
            onWheel={onWheel}
        >
            <img 
                src={src} 
                alt="Return Evidence Fullscreen" 
                draggable={false} 
                style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", userSelect: "none", ...transformStyle }} 
            />
        </div>
    );
}

export default function SellerReturns() {
  const [sellerId, setSellerId] = useState(null);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [fullscreenImg, setFullscreenImg] = useState(null);

  /* =========================================
      EASY ENCRYPTION HELPERS
  ========================================= */
  const secureGetItem = (key) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    try {
      return item ? atob(item) : null;
    } catch (e) {
      return null;
    }
  };

  const decodePayload = (payload) => {
    try {
      const decodedString = atob(payload);
      return JSON.parse(decodedString);
    } catch (e) {
      console.error("Returns data decryption failed:", e);
      return null;
    }
  };

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
      
      let data = [];
      if (res.data?.payload) {
        const decodedData = decodePayload(res.data.payload);
        data = decodedData?.returns || [];
      } else {
        data = res.data.returns || [];
      }
      
      setReturns(data);
    } catch (err) {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sid = secureGetItem("sellerId");
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

  if (loading) return (
    <div className="ms-root">
      <Sidebar />
      <LoadingSpinner message="Retrieving return requests..." />
    </div>
  );

  return (
    <>
      {loadingId && <LoadingSpinner message="Updating request status..." />}

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

          {returns.length === 0 ? (
            <p className="empty-text">No return requests found for your store.</p>
          ) : (
            <div className="returns-grid">
              {returns.map((r) => {
                const status = deriveReturnStatus(r);

                return (
                  <div key={r.id} className="return-card business-reveal">
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
                          {r.images.map((img, idx) => {
                            const fullUrl = img.startsWith('http') ? img : `http://localhost:3000${img}`;
                            return (
                              <div 
                                key={idx} 
                                className="thumb-wrapper"
                                onClick={() => setFullscreenImg(fullUrl)}
                              >
                                <img src={fullUrl} alt="Return proof" className="return-thumb" />
                                <div className="thumb-overlay"><FaExpand /></div>
                              </div>
                            );
                          })}
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

        {/* Updated Lightbox with Zoom and Drag */}
        {fullscreenImg && (
          <div className="lightbox-overlay" onClick={() => setFullscreenImg(null)}>
            <button className="lightbox-close" onClick={() => setFullscreenImg(null)}>
              <FaTimes />
            </button>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <LightboxImage src={fullscreenImg} />
            </div>
          </div>
        )}

        {approveModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Approve Return?</h3>
              <p>Are you sure you want to approve this return request? This will be sent for admin finalisation.</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setApproveModalOpen(false)}>
                  Cancel
                </button>
                <button className="confirm-reject-btn" style={{ background: "#6b7c5c" }} onClick={handleApprove}>
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        )}

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
    </>
  );
}