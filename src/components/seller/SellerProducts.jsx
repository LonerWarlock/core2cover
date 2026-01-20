"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import MessageBox from "../ui/MessageBox";
import "./SellerProducts.css";
import { FaBoxes, FaTruckLoading, FaRulerCombined, FaStar } from "react-icons/fa"; // Added FaStar for feedback section
import { 
  getSellerProducts, 
  deleteSellerProduct,
  getProductRatings,
  updateSellerProduct
} from "../../api/seller";

const SellerProducts = () => {
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
    newImages: []
  });

  const calculateFinalPrice = (base) => {
    const val = parseFloat(base);
    if (isNaN(val) || val <= 0) return 0;
    let rate = 0;
    if (val < 10000) rate = 0.07;
    else if (val < 50000) rate = 0.05;
    else rate = 0.035;
    return (val + (val * rate)).toFixed(2);
  };

  const fetchProducts = useCallback(async (sid) => {
    try {
      setLoading(true);
      const res = await getSellerProducts(sid);
      const cleanData = (res.data || []).map(p => ({
        ...p,
        images: Array.isArray(p.images) ? p.images.filter(img => img && img !== "null") : []
      }));
      setMaterials(cleanData);
    } catch (err) {
      triggerMsg("Failed to load your inventory catalogue.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sid = localStorage.getItem("sellerId");
      if (sid) {
        setSellerId(sid);
        fetchProducts(sid);
      } else setLoading(false);
    }
  }, [fetchProducts]);

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
      unitsPerTrip: product.unitsPerTrip || "",
      conversionFactor: product.conversionFactor || "",
      productType: product.productType,
      existingImages: product.images || [],
      newImages: []
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
    
    const finalCalculatedPrice = calculateFinalPrice(editForm.price);
    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("price", finalCalculatedPrice); 
    formData.append("category", editForm.category);
    formData.append("description", editForm.description);
    formData.append("availability", editForm.availability);
    formData.append("productType", editForm.productType);
    
    if (editForm.productType === "material") {
      formData.append("unit", editForm.unit);
      formData.append("unitsPerTrip", editForm.unitsPerTrip);
      formData.append("conversionFactor", editForm.conversionFactor);
    }

    formData.append("existingImages", JSON.stringify(editForm.existingImages));
    editForm.newImages.forEach(file => formData.append("images", file));

    try {
      await updateSellerProduct(editingProduct.id, formData);
      triggerMsg("Catalogue updated successfully!", "success");
      setEditingProduct(null);
      fetchProducts(sellerId);
    } catch (err) {
      triggerMsg("Failed to update the product.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteSellerProduct(id);
      triggerMsg("Product removed from inventory.", "success");
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      triggerMsg("Could not delete the product.", "error");
    }
  };

  /* FIXED VIEW REVIEWS WITH AUTO-SCROLL */
  const viewReviews = async (product) => {
    setSelectedProduct(product);
    setLoadingReviews(true);
    
    // Smooth scroll to top as soon as button is clicked
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await getProductRatings(product.id);
      setRatingData({
        avgRating: res.data.avgRating || 0,
        count: res.data.count || 0,
        reviews: res.data.reviews || [],
      });
    } catch (err) {
      triggerMsg("Failed to load customer reviews.", "error");
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div className="ms-root">
      {msg.show && <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />}
      <Sidebar />
      <main className="ms-main">
        <h1 className="ms-title">Inventory Catalogue</h1>

        {/* EDIT PANEL */}
        {editingProduct && (
          <section className="ms-edit-panel">
            <h2 className="ms-edit-title">Edit Product: {editingProduct.name}</h2>
            <form onSubmit={submitUpdate} className="ms-edit-grid">
              <div className="ms-field">
                <label className="ms-label">Product Name</label>
                <input className="ms-input" name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div className="ms-field">
                <label className="ms-label">Your Price (₹)</label>
                <input className="ms-input" type="number" name="price" value={editForm.price} onChange={handleEditChange} required />
              </div>
              <div className="ms-field">
                <label className="ms-label">Listing Price (Incl. Commission)</label>
                <input className="ms-input" value={`₹ ${calculateFinalPrice(editForm.price)}`} readOnly style={{ backgroundColor: "#f3f4f6", color: "#606E52", fontWeight: "bold" }} />
              </div>
              
              {editForm.productType === "material" && (
                <>
                  <div className="ms-field">
                    <label className="ms-label">Unit</label>
                    <select className="ms-select" name="unit" value={editForm.unit} onChange={handleEditChange}>
                      <option value="pcs">Pieces</option>
                      <option value="sqft">Sq. Ft</option>
                      <option value="sheet">Sheets</option>
                      <option value="metre">Metres</option>
                    </select>
                  </div>
                  <div className="ms-field">
                    <label className="ms-label">Units per Trip</label>
                    <input className="ms-input" type="number" name="unitsPerTrip" value={editForm.unitsPerTrip} onChange={handleEditChange} required />
                  </div>
                  {(editForm.unit === "sheet" || editForm.unit === "pcs") && (
                    <div className="ms-field">
                      <label className="ms-label">Sq. Ft per {editForm.unit}</label>
                      <input className="ms-input" type="number" step="0.01" name="conversionFactor" value={editForm.conversionFactor} onChange={handleEditChange} required />
                    </div>
                  )}
                </>
              )}

              <div className="ms-field">
                <label className="ms-label">Availability</label>
                <select className="ms-select" name="availability" value={editForm.availability} onChange={handleEditChange}>
                  <option value="available">Available</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              <div className="ms-field ms-full">
                <label className="ms-label">Description</label>
                <textarea className="ms-textarea" name="description" value={editForm.description} onChange={handleEditChange} />
              </div>

              <div className="ms-edit-section ms-full">
                <h4 className="ms-edit-section-title">Manage Images</h4>
                <div className="ms-media-grid">
                  {editForm.existingImages.map((url, idx) => (
                    <div key={idx} className="ms-media-card" onClick={() => setEditForm(p => ({...p, existingImages: p.existingImages.filter(img => img !== url)}))}>
                      <img src={url} className="ms-preview" alt="Current" />
                      <span className="ms-btn--danger">Remove</span>
                    </div>
                  ))}
                </div>
                <input type="file" multiple accept="image/*" onChange={(e) => setEditForm(p => ({...p, newImages: Array.from(e.target.files)}))} className="ms-file" />
              </div>

              <div className="ms-edit-actions ms-full">
                <button type="submit" className="ms-btn ms-btn--primary" disabled={isUpdating}>{isUpdating ? "Finalising..." : "Save Changes"}</button>
                <button type="button" className="ms-btn ms-btn--outline" onClick={() => setEditingProduct(null)}>Cancel</button>
              </div>
            </form>
          </section>
        )}

        {/* REVIEW PANEL */}
        {selectedProduct && (
          <section className="ms-reviews-panel">
            <div className="ms-panel-header">
              <h3>Customer Feedback: {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="ms-btn ms-btn--ghost">Close</button>
            </div>
            <div className="ms-review-summary">
                <p>Average Rating: <FaStar color="#facc15" /> {ratingData.avgRating} / 5 ({ratingData.count} reviews)</p>
            </div>
            {/* You can map through ratingData.reviews here if needed */}
          </section>
        )}

        <section className="ms-grid">
          {loading ? <p>Loading catalogue...</p> : materials.map((m) => (
            <div key={m.id} className="ms-card">
              <div className="ms-img-container">
                <img src={m.images[slideIndex[m.id] || 0] || "/placeholder.jpg"} className="ms-thumb" alt={m.name} />
                <div className={`ms-status-badge ${m.availability}`}>
                  {m.availability.replace('_', ' ')}
                </div>
              </div>
              <div className="ms-body">
                <div className="ms-header-row">
                  <h3 className="ms-name">{m.name}</h3>
                  <span className="ms-type-tag">{m.productType}</span>
                </div>
                
                <p className="ms-price">₹{Number(m.price).toLocaleString('en-IN')} <span className="ms-unit-text">/ {m.unit || 'pcs'}</span></p>
                <p className="ms-category">{m.category}</p>

                <div className="ms-logistics-info">
                  <div className="ms-info-item">
                    <FaTruckLoading title="Units per Trip" />
                    <span>{m.unitsPerTrip || 1} {m.unit || 'pcs'} / trip</span>
                  </div>
                  
                  {m.productType === "material" && (m.unit === "sheet" || m.unit === "pcs") && (
                    <div className="ms-info-item">
                      <FaRulerCombined title="Conversion Factor" />
                      <span>{m.conversionFactor || 1} sq. ft / {m.unit}</span>
                    </div>
                  )}
                </div>

                {m.description && (
                  <p className="ms-desc-preview">
                    {m.description.substring(0, 60)}{m.description.length > 60 ? "..." : ""}
                  </p>
                )}
              </div>
              
              <div className="ms-actions">
                <button className="ms-btn ms-btn--outline" onClick={() => startEdit(m)}>Edit</button>
                <button className="ms-btn ms-btn--ghost" onClick={() => viewReviews(m)}>Reviews</button>
                <button className="ms-btn ms-btn--danger" onClick={() => handleDelete(m.id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default SellerProducts;