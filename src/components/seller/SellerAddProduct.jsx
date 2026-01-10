// File: src/components/supplier/SellerAddProduct.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./SellerAddProduct.css";
import { addSellerProduct } from "../../api/seller";

const SellerAddProduct = () => {
  const navigate = useNavigate();

  /* ===============================
     FORM STATE
  =============================== */
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [productType, setProductType] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("available");

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  /* ===============================
     PRODUCT TYPE & CATEGORY
  =============================== */
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

  /* ===============================
     IMAGE HANDLING
  =============================== */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Each image must be under 5MB.");
        return;
      }
    }

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = "";
  };

  /* ===============================
     VIDEO HANDLING
  =============================== */
  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Only video files allowed.");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert("Video must be under 30MB.");
      return;
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Product name is required.");
    if (!productType) return alert("Select product type.");
    if (!category) return alert("Select category.");
    if (price === "" || Number(price) < 0)
      return alert("Enter a valid price.");
    if (images.length < 1 || images.length > 10)
      return alert("Upload 1–10 images.");

    const sellerId = localStorage.getItem("sellerId");
    if (!sellerId) return alert("Seller not logged in.");

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("sellerId", sellerId);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("productType", productType);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("availability", availability);

      images.forEach((img) => formData.append("images", img));
      if (video) formData.append("video", video);

      await addSellerProduct(formData);

      alert("Product added successfully ✅");

      setName("");
      setPrice("");
      setProductType("");
      setCategory("");
      setDescription("");
      setAvailability("available");
      setImages([]);
      setImagePreviews([]);
      setVideo(null);
      setVideoPreview(null);

      navigate("/selleraddproduct");
    } catch (err) {
      console.error("ADD PRODUCT ERROR:", err);
      alert(
        err?.response?.data?.message ||
          "Server error while adding product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="sma-root">
      <Sidebar />
      <main className="sma-main">
        <form className="sma-card" onSubmit={handleSubmit}>
          <h2 className="sma-title">➕ Add New Product</h2>

          <div className="sma-grid">
            <label className="sma-field">
              <span className="sma-label">Product Name *</span>
              <input
                className="sma-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="sma-field">
              <span className="sma-label">Price *</span>
              <input
                type="number"
                min="0"
                className="sma-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>

            <label className="sma-field">
              <span className="sma-label">Product Type *</span>
              <select
                className="sma-input"
                value={productType}
                onChange={(e) => {
                  setProductType(e.target.value);
                  setCategory("");
                }}
              >
                <option value="">Select</option>
                <option value="finished">Finished Interior Product</option>
                <option value="material">Interior Material</option>
              </select>
            </label>

            <label className="sma-field">
              <span className="sma-label">Category *</span>
              <select
                className="sma-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!productType}
              >
                <option value="">Select</option>
                {productType &&
                  productCategories[productType].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </label>

            <label className="sma-field">
              <span className="sma-label">Availability</span>
              <select
                className="sma-input"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="available">Available</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </label>

            <label className="sma-field sma-full">
              <span className="sma-label">Description</span>
              <textarea
                className="sma-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="sma-field sma-full">
              <span className="sma-label">Upload Images (1–10)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="sma-file"
              />

              {imagePreviews.length > 0 && (
                <div className="sma-preview-grid">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} className="sma-preview" />
                  ))}
                </div>
              )}
            </label>

            <label className="sma-field sma-full">
              <span className="sma-label">Upload Videos (1-5 *optional)</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideo}
                className="sma-file"
              />

              {videoPreview && (
                <video src={videoPreview} controls className="sma-preview" />
              )}
            </label>
          </div>

          <div className="sma-actions">
            <button
              type="submit"
              className="sma-btn sma-btn--primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SellerAddProduct;
