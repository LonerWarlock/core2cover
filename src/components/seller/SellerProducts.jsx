"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import MessageBox from "../ui/MessageBox";
import LoadingSpinner from "../ui/LoadingSpinner";
import "./SellerProducts.css";
import { FaBoxes, FaTruckLoading, FaRulerCombined, FaStar, FaVideo, FaPlay, FaTint } from "react-icons/fa";
import {
  getSellerProducts,
  deleteSellerProduct,
  getProductRatings,
  updateSellerProduct
} from "../../api/seller";

const SellerProducts = () => {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState(null);
  const [slideIndex, setSlideIndex] = useState({});

  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  const triggerMsg = (text, type = "success") => setMsg({ text, type, show: true });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingData, setRatingData] = useState({ avgRating: 0, count: 0, reviews: [] });
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    availability: "available",
    unit: "pcs",
    unitsPerTrip: "",
    conversionFactor: "",
    productType: "",
    existingImages: [],
    newImages: [],
    existingVideo: null,
    newVideo: null
  });

  const secureGetItem = (key) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    try { return item ? atob(item) : null; } catch (e) { return null; }
  };

  const decodePayload = (payload) => {
    try {
      const decodedString = atob(payload);
      return JSON.parse(decodedString);
    } catch (e) { return null; }
  };

  const calculateFinalPrice = (base) => {
    const val = parseFloat(base);
    if (isNaN(val) || val <= 0) return 0;
    let rate = val < 10000 ? 0.07 : val < 50000 ? 0.05 : 0.035;
    return (val + (val * rate)).toFixed(2);
  };

  const fetchProducts = useCallback(async (sid) => {
    try {
      setLoading(true);
      const res = await getSellerProducts(sid);
      let rawData = res.data?.payload ? decodePayload(res.data.payload) : (Array.isArray(res.data) ? res.data : []);
      const cleanData = rawData.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? p.images.filter(img => img && img !== "null") : []
      }));
      setMaterials(cleanData);
    } catch (err) {
      triggerMsg("Failed to load inventory catalogue.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sid = secureGetItem("sellerId");
      if (sid) { setSellerId(sid); fetchProducts(sid); }
      else { router.push("/sellerlogin"); setLoading(false); }
    }
  }, [fetchProducts, router]);

  useEffect(() => {
    if (materials.length === 0) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        const next = { ...prev };
        materials.forEach((m) => {
          const len = m.images?.length || 1;
          next[m.id] = ((next[m.id] || 0) + 1) % len;
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [materials]);

  const startEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      availability: product.availability || "available",
      unit: product.unit || "pcs",
      unitsPerTrip: String(product.unitsPerTrip || "1"),
      conversionFactor: String(product.conversionFactor || "1"),
      productType: product.productType,
      existingImages: product.images || [],
      newImages: [],
      existingVideo: product.video || null,
      newVideo: null
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", editForm.name.trim());
      formData.append("price", String(editForm.price || "0"));
      formData.append("category", editForm.category.trim());
      formData.append("description", editForm.description.trim());
      formData.append("availability", editForm.availability);
      formData.append("productType", editForm.productType);

      // Update measurement logic
      formData.append("unit", editForm.unit);
      formData.append("unitsPerTrip", String(editForm.unitsPerTrip || "1"));
      formData.append("conversionFactor", String(editForm.conversionFactor || "1"));

      formData.append("existingImages", JSON.stringify(editForm.existingImages));
      if (editForm.newImages.length > 0) {
        editForm.newImages.forEach(file => formData.append("images", file));
      }

      if (editForm.newVideo) {
        formData.append("video", editForm.newVideo);
      } else if (editForm.existingVideo) {
        formData.append("existingVideo", editForm.existingVideo);
      }

      await updateSellerProduct(editingProduct.id, formData);
      triggerMsg("Catalogue updated successfully!", "success");
      setEditingProduct(null);
      await fetchProducts(sellerId);
    } catch (err) {
      triggerMsg("Update failed.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteSellerProduct(id);
      triggerMsg("Product removed.", "success");
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (err) { triggerMsg("Delete failed.", "error"); }
  };

  if (loading) return <LoadingSpinner message="Opening inventory..." />;

  return (
    <div className="ms-root">
      {isUpdating && <LoadingSpinner message="Finalizing changes..." />}
      {msg.show && <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />}
      <Sidebar />
      <main className="ms-main">
        <h1 className="ms-title">Inventory Catalogue</h1>

        {editingProduct && (
          <section className="ms-edit-panel">
            <h2 className="ms-edit-title">Edit Product: {editingProduct.name}</h2>
            <form onSubmit={submitUpdate} className="ms-edit-grid">
              <div className="ms-field">
                <label className="ms-label">Product Name</label>
                <input className="ms-input" name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div className="ms-field">
                <label className="ms-label">
                  Your Price (₹)
                  <span className="ms-label-hint"> (per 1 {editForm.unit || 'pcs'})</span>
                </label>
                <input
                  className="ms-input"
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  placeholder={`Enter price for 1 ${editForm.unit || 'piece'}`}
                  required
                />
                <p className="ms-helper-text">
                  The price entered should be for exactly **one {editForm.unit || 'unit'}** (e.g., price for 1 litre, 1 sq. ft, or 1 sheet).
                </p>
              </div>

              <div className="ms-field">
                <label className="ms-label">Availability</label>
                <select className="ms-select" name="availability" value={editForm.availability} onChange={handleEditChange}>
                  <option value="available">Available</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Updated Measurement Fields in Edit Mode */}
              {(editForm.productType === "material" || editForm.productType === "Raw Material") && (
                <>
                  <div className="ms-field">
                    <label className="ms-label">Measurement Unit</label>
                    <select className="ms-select" name="unit" value={editForm.unit} onChange={handleEditChange}>
                      <option value="pcs">Pieces (Pcs)</option>
                      <option value="sqft">Square Foot (Sq. Ft)</option>
                      <option value="sheet">Sheets</option>
                      <option value="metre">Metres (m)</option>
                      <option value="litre">Litres (L)</option>
                    </select>
                  </div>
                  <div className="ms-field">
                    <label className="ms-label">Units per Delivery Trip</label>
                    <input className="ms-input" type="number" name="unitsPerTrip" value={editForm.unitsPerTrip} onChange={handleEditChange} required />
                  </div>
                  {(editForm.unit === "sheet" || editForm.unit === "pcs") && (
                    <div className="ms-field">
                      <label className="ms-label">Sq. Ft per {editForm.unit === "sheet" ? "Sheet" : "Piece"}</label>
                      <input className="ms-input" type="number" step="0.01" name="conversionFactor" value={editForm.conversionFactor} onChange={handleEditChange} required />
                    </div>
                  )}
                </>
              )}

              <div className="ms-field ms-full">
                <label className="ms-label">Description</label>
                <textarea className="ms-textarea" name="description" value={editForm.description} onChange={handleEditChange} />
              </div>

              <div className="ms-edit-section ms-full">
                <h4 className="ms-edit-section-title">Manage Images</h4>
                <div className="ms-media-grid">
                  {editForm.existingImages.map((url, idx) => (
                    <div key={idx} className="ms-media-card" onClick={() => setEditForm(p => ({ ...p, existingImages: p.existingImages.filter(img => img !== url) }))}>
                      <img src={url} className="ms-preview" alt="Current" />
                      <span className="ms-btn--danger">Remove</span>
                    </div>
                  ))}
                </div>
                <input type="file" multiple accept="image/*" onChange={(e) => setEditForm(p => ({ ...p, newImages: Array.from(e.target.files) }))} className="ms-file" />
              </div>

              <div className="ms-edit-section ms-full">
                <h4 className="ms-edit-section-title"><FaVideo /> Product Video</h4>
                {editForm.existingVideo && !editForm.newVideo && (
                  <div className="ms-media-card" style={{ width: '200px' }} onClick={() => setEditForm(p => ({ ...p, existingVideo: null }))}>
                    <video src={editForm.existingVideo} className="ms-preview" muted />
                    <span className="ms-btn--danger">Remove Video</span>
                  </div>
                )}
                <input type="file" accept="video/*" onChange={(e) => setEditForm(p => ({ ...p, newVideo: e.target.files[0] }))} className="ms-file" />
              </div>

              <div className="ms-edit-actions ms-full">
                <button type="submit" className="ms-btn ms-btn--primary" disabled={isUpdating}>Save Changes</button>
                <button type="button" className="ms-btn ms-btn--outline" onClick={() => setEditingProduct(null)}>Cancel</button>
              </div>
            </form>
          </section>
        )}

        <section className="ms-grid">
          {materials.map((m) => {
            const isMaterial = m.productType === "material" || m.productType === "Raw Material";
            const isLiquid = m.unit?.toLowerCase() === "litre";

            return (
              <div key={m.id} className="ms-card">
                <div className="ms-img-container">
                  <img src={m.images[slideIndex[m.id] || 0] || "/placeholder.jpg"} className="ms-thumb" alt={m.name} />
                  {m.video && <div className="ms-video-indicator"><FaPlay /></div>}
                  <div className={`ms-status-badge ${m.availability}`}>{m.availability.replace('_', ' ')}</div>
                </div>
                <div className="ms-body">
                  <h3 className="ms-name">{m.name}</h3>
                  <p className="ms-price">₹{Number(m.price).toLocaleString('en-IN')} <span className="ms-unit-text">/ {m.unit || 'pcs'}</span></p>

                  {/* Updated Display Logistics */}
                  <div className="ms-logistics-info">
                    <div className="ms-info-item">
                      <FaTruckLoading /> <span>{m.unitsPerTrip || 1} {m.unit}/trip</span>
                    </div>
                    {isMaterial && (m.unit === "sheet" || m.unit === "pcs") && (
                      <div className="ms-info-item">
                        <FaRulerCombined /> <span>{m.conversionFactor || 1} sqft/{m.unit === "sheet" ? "sheet" : "unit"}</span>
                      </div>
                    )}
                    {isLiquid && (
                      <div className="ms-info-item">
                        <FaTint /> <span>Volume-based delivery</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ms-actions">
                  <button className="ms-btn ms-btn--outline" onClick={() => startEdit(m)}>Edit</button>
                  <button className="ms-btn ms-btn--danger" onClick={() => handleDelete(m.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default SellerProducts;