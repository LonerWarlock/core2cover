"use client"; // Necessary for Next.js 13+ App Router

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./SellerProducts.css";
import { FaStar, FaRegStar } from "react-icons/fa";

import {
  getSellerProducts,
  updateSellerProduct,
  deleteSellerProduct,
  getProductRatings,
} from "../../api/seller";

/* ===============================
    AVAILABILITY FORMATTER
=============================== */
const formatAvailability = (value) => {
  switch (value) {
    case "available":
      return "Available";
    case "out_of_stock":
      return "Out of Stock";
    case "low_stock":
      return "Low Stock";
    case "discontinued":
      return "Discontinued";
    default:
      return "Available";
  }
};

/* ===============================
    PRODUCT TYPE & CATEGORY
================================ */
const productCategories = {
  finished: [
    "Furniture",
    "Modular Kitchen",
    "Doors & Windows",
    "Wardrobes",
    "Lighting",
    "Wall Panels",
    "Decor Items",
  ],
  material: [
    "Plywood & Boards",
    "MDF / HDF",
    "Laminates & Veneers",
    "Hardware & Fittings",
    "Glass & Mirrors",
    "Marble & Stone",
    "Fabrics & Upholstery",
    "Paints & Finishes",
  ],
};

const SellerProducts = () => {
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState({});
  const [sellerId, setSellerId] = useState(null);

  /* ===============================
      REVIEWS STATE ✅
  ================================ */
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingData, setRatingData] = useState({
    avgRating: 0,
    count: 0,
    reviews: [],
  });

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    productType: "",
    price: "",
    description: "",
    availability: "available",
    existingImages: [],
    newImageFiles: [],
    newImagePreviews: [],
    existingVideo: null,
    newVideoFile: null,
    newVideoPreview: null,
  });

  /* =========================
      SAFE STORAGE ACCESS
  ========================= */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSellerId(localStorage.getItem("sellerId"));
    }
  }, []);

  /* =========================
      FETCH PRODUCTS
  ========================= */
  useEffect(() => {
    if (!sellerId) return;

    getSellerProducts(sellerId)
      .then((res) => setMaterials(res.data || []))
      .finally(() => setLoading(false));
  }, [sellerId]);

  /* =========================
      SLIDESHOW
  ========================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        const next = { ...prev };
        materials.forEach((m) => {
          const len = m.images?.length || 1;
          next[m.id] = ((next[m.id] || 0) + 1) % len;
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [materials]);

  /* =========================
      STAR RENDER
  ========================= */
  const renderStars = (rating = 0) => {
    const rounded = Math.round(rating);
    return [...Array(5)].map((_, i) =>
      i < rounded ? <FaStar key={i} /> : <FaRegStar key={i} />
    );
  };

  /* =========================
      LOAD REVIEWS
  ========================= */
  const viewReviews = async (product) => {
    setSelectedProduct(product);

    try {
      const res = await getProductRatings(product.id);
      setRatingData({
        avgRating: res.data.avgRating || 0,
        count: res.data.count || 0,
        reviews: res.data.reviews || [],
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setRatingData({ avgRating: 0, count: 0, reviews: [] });
    }
  };

  /* =========================
      START EDIT
  ========================= */
  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({
      name: m.name,
      category: m.category,
      productType: m.productType,
      price: m.price,
      description: m.description || "",
      availability: m.availability || "available",
      existingImages: (m.images || []).map(
        (img) => `http://localhost:3001/${img}`
      ),
      newImageFiles: [],
      newImagePreviews: [],
      existingVideo: m.video ? `http://localhost:3001/${m.video}` : null,
      newVideoFile: null,
      newVideoPreview: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => setEditingId(null);

  /* =========================
      FORM HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setEditForm((p) => ({
      ...p,
      newImageFiles: [...p.newImageFiles, ...files],
      newImagePreviews: [
        ...p.newImagePreviews,
        ...files.map((f) => URL.createObjectURL(f)),
      ],
    }));
  };

  const removeExistingImage = (img) => {
    setEditForm((p) => ({
      ...p,
      existingImages: p.existingImages.filter((i) => i !== img),
    }));
  };

  const removeNewImage = (index) => {
    setEditForm((p) => ({
      ...p,
      newImageFiles: p.newImageFiles.filter((_, i) => i !== index),
      newImagePreviews: p.newImagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEditForm((p) => ({
      ...p,
      newVideoFile: file,
      newVideoPreview: URL.createObjectURL(file),
    }));
  };

  const removeVideo = () => {
    setEditForm((p) => ({
      ...p,
      existingVideo: null,
      newVideoFile: null,
      newVideoPreview: null,
    }));
  };

  /* =========================
      SAVE EDIT
  ========================= */
  const saveEdit = async () => {
    try {
      const fd = new FormData();

      fd.append("name", editForm.name);
      fd.append("category", editForm.category);
      fd.append("productType", editForm.productType);
      fd.append("price", editForm.price);
      fd.append("description", editForm.description);
      fd.append("availability", editForm.availability);

      const keptImages = editForm.existingImages.map((img) =>
        img.replace("http://localhost:3001/", "")
      );
      fd.append("existingImages", JSON.stringify(keptImages));

      editForm.newImageFiles.forEach((f) => fd.append("images", f));

      if (editForm.newVideoFile) {
        fd.append("video", editForm.newVideoFile);
      } else if (!editForm.existingVideo) {
        fd.append("removeVideo", "true");
      }

      const res = await updateSellerProduct(editingId, fd);

      setMaterials((prev) =>
        prev.map((p) => (p.id === editingId ? res.data.product : p))
      );

      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    }
  };

  /* =========================
      DELETE PRODUCT
  ========================= */
  const removeMaterial = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteSellerProduct(id);
    setMaterials((p) => p.filter((m) => m.id !== id));
  };

  return (
    <div className="ms-root">
      <Sidebar />

      <main className="ms-main">
        <h1 className="ms-title">My Products</h1>

        {/* REVIEWS PANEL (TOP) */}
        {selectedProduct && (
          <section className="ms-reviews-panel">
            <h3 className="ms-reviews-title">
              Reviews – {selectedProduct.name}
            </h3>

            <div className="ms-rating-summary">
              <div className="ms-stars">
                {renderStars(ratingData.avgRating)}
              </div>
              <span className="ms-rating-number">
                {ratingData.avgRating.toFixed(1)}
              </span>
              <span className="ms-rating-count">
                ({ratingData.count} ratings)
              </span>
            </div>

            <div className="ms-reviews-list">
              {ratingData.reviews.length === 0 ? (
                <p className="ms-no-reviews">No reviews yet</p>
              ) : (
                ratingData.reviews.map((r) => (
                  <div key={r.id} className="ms-review-card">
                    <div className="ms-stars">
                      {renderStars(r.stars)}
                    </div>
                    <p className="ms-review-user">{r.user}</p>
                    <p className="ms-review-text">
                      {r.comment || "No comment"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* EDIT PANEL */}
        {editingId && (
          <section className="ms-edit-panel">
            <div className="ms-edit-header">
              <h2 className="ms-edit-title">Edit Product</h2>
              <p className="ms-edit-sub">
                Update product details, images & video
              </p>
            </div>

            <div className="ms-edit-section">
              <h4 className="ms-edit-section-title">Basic Information</h4>
              <div className="ms-edit-grid">
                <div className="ms-field">
                  <label className="ms-label">Product Name</label>
                  <input
                    className="ms-input"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="ms-field">
                  <label className="ms-label">Product Type</label>
                  <select
                    className="ms-select"
                    name="productType"
                    value={editForm.productType}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditForm((p) => ({
                        ...p,
                        productType: value,
                        category: "", 
                      }));
                    }}
                  >
                    <option value="">Select type</option>
                    <option value="finished">Finished Product</option>
                    <option value="material">Raw Material</option>
                  </select>
                </div>

                <div className="ms-field">
                  <label className="ms-label">Category</label>
                  <select
                    className="ms-select"
                    name="category"
                    value={editForm.category}
                    onChange={handleChange}
                    disabled={!editForm.productType}
                  >
                    <option value="">
                      {editForm.productType
                        ? "Select category"
                        : "Select product type first"}
                    </option>

                    {editForm.productType &&
                      productCategories[editForm.productType]?.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="ms-field">
                  <label className="ms-label">Price (₹)</label>
                  <input
                    className="ms-input"
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="ms-field">
                  <label className="ms-label">Availability</label>
                  <select
                    className="ms-select"
                    name="availability"
                    value={editForm.availability}
                    onChange={handleChange}
                  >
                    <option value="available">Available</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="ms-field ms-full">
                  <label className="ms-label">Description</label>
                  <textarea
                    className="ms-textarea"
                    name="description"
                    value={editForm.description}
                    onChange={handleChange}
                    placeholder="Describe the product in detail…"
                  />
                </div>
              </div>
            </div>

            <div className="ms-edit-section">
              <h4 className="ms-edit-section-title">Product Images</h4>
              <div className="ms-media-grid">
                {editForm.existingImages.map((img) => (
                  <div key={img} className="ms-media-card">
                    <img src={img} className="ms-preview" alt="Existing" />
                    <button
                      className="ms-btn ms-btn--ghost"
                      onClick={() => removeExistingImage(img)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <input
                className="ms-file"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
              />
            </div>

            <div className="ms-edit-section">
              <h4 className="ms-edit-section-title">Product Video</h4>
              <div className="ms-media-grid">
                {editForm.existingVideo && (
                  <video
                    src={editForm.existingVideo}
                    controls
                    className="ms-preview"
                  />
                )}

                {editForm.newVideoPreview && (
                  <video
                    src={editForm.newVideoPreview}
                    controls
                    className="ms-preview"
                  />
                )}
              </div>
              <input
                className="ms-file"
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
              />
              <button
                className="ms-btn ms-btn--ghost"
                onClick={removeVideo}
              >
                Remove Video
              </button>
            </div>

            <div className="ms-edit-actions">
              <button
                className="ms-btn ms-btn--primary"
                onClick={saveEdit}
              >
                Save Changes
              </button>
              <button
                className="ms-btn ms-btn--outline"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* GRID */}
        <section className="ms-grid">
          {materials.map((m) => {
            const img =
              m.images?.length
                ? m.images[slideIndex[m.id] || 0]
                : null;

            const imageSrc = img
              ? img.startsWith("http")
                ? img
                : `http://localhost:3001/${img}`
              : "";

            return (
              <div key={m.id} className="ms-card">
                <img
                  src={imageSrc}
                  className="ms-thumb"
                  alt={m.name}
                />
                <div className="ms-body">
                  <h3 className="ms-name">{m.name}</h3>
                  <p className="ms-price">₹{Number(m.price).toLocaleString()}</p>
                  <p className={`ms-meta stock-${m.availability}`}>
                    Status: <strong>{formatAvailability(m.availability)}</strong>
                  </p>
                  <p className="ms-meta">
                    Category: <strong>{m.category}</strong>
                  </p>
                  <p className="ms-meta">
                    Type: <strong>{m.productType}</strong>
                  </p>
                </div>

                <div className="ms-actions">
                  <button
                    className="ms-btn ms-btn--outline"
                    onClick={() => startEdit(m)}
                  >
                    Edit
                  </button>
                  <button
                    className="ms-btn ms-btn--danger"
                    onClick={() => removeMaterial(m.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="ms-btn ms-btn--outline"
                    onClick={() => viewReviews(m)}
                  >
                    View Reviews
                  </button>
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