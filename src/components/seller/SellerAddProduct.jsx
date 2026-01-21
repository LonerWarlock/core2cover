"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import "./SellerAddProduct.css";
import { addSellerProduct } from "../../api/seller";
import MessageBox from "../ui/MessageBox";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerAddProduct = () => {
  const router = useRouter();

  const [sellerId, setSellerId] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  const [productType, setProductType] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("available");

  // LOGISTICS FIELDS
  const [unit, setUnit] = useState("pcs");
  const [unitsPerTrip, setUnitsPerTrip] = useState("");
  const [conversionFactor, setConversionFactor] = useState("");

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const triggerMsg = (text, type = "success") => setMsg({ text, type, show: true });

  useEffect(() => {
    setMounted(true);
    const sid = localStorage.getItem("sellerId");
    if (!sid) router.push("/sellerlogin");
    else setSellerId(sid);
  }, [router]);

  // Commission Calculation
  useEffect(() => {
    const basePrice = parseFloat(price);
    if (isNaN(basePrice) || basePrice <= 0) {
      setFinalPrice(0);
      return;
    }

    let commissionRate = 0;
    if (basePrice < 10000) commissionRate = 0.07;
    else if (basePrice < 50000) commissionRate = 0.05;
    else commissionRate = 0.035;

    const calculated = basePrice + (basePrice * commissionRate);
    setFinalPrice(calculated.toFixed(2));
  }, [price]);

  const productCategories = {
    finished: ["Furniture", "Modular Kitchen", "Doors & Windows", "Wardrobes", "Lighting", "Wall Panels", "Decor Items"],
    material: ["Plywood & Boards", "MDF / HDF", "Laminates & Veneers", "Hardware & Fittings", "Glass & Mirrors", "Marble & Stone", "Fabrics & Upholstery", "Paints & Finishes"],
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) return triggerMsg("Max 10 images allowed", "error");
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 30 * 1024 * 1024) return triggerMsg("Video must be under 30MB.", "error");
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return triggerMsg("Product name is required.", "error");
    if (images.length < 1) return triggerMsg("Upload at least 1 image.", "error");
    
    if (productType === "material") {
      if (!unitsPerTrip || parseFloat(unitsPerTrip) <= 0) {
        return triggerMsg("Please specify units per delivery trip.", "error");
      }
      if ((unit === "sheet" || unit === "pcs") && (!conversionFactor || parseFloat(conversionFactor) <= 0)) {
        return triggerMsg(`Please specify Sq. Ft per ${unit}.`, "error");
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("sellerId", sellerId);
      formData.append("name", name);
      formData.append("price", finalPrice);
      formData.append("productType", productType);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("availability", availability);

      // LOGISTICS DATA
      formData.append("unit", productType === "material" ? unit : "pcs");
      formData.append("unitsPerTrip", productType === "material" ? unitsPerTrip : 1);
      formData.append("conversionFactor", productType === "material" ? conversionFactor : 1);

      images.forEach((img) => formData.append("images", img));
      if (video) formData.append("video", video);

      await addSellerProduct(formData);
      triggerMsg("Product listed successfully! ");

      // Reset form
      setName("");
      setPrice("");
      setProductType("");
      setCategory("");
      setDescription("");
      setImages([]);
      setImagePreviews([]);
      setVideo(null);
      setVideoPreview(null);
      setUnit("pcs");
      setUnitsPerTrip("");     
      setConversionFactor("");  
    } catch (err) {
      triggerMsg("Server error while adding product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* 2. PLACED AT THE TOP LEVEL TO ENSURE MAXIMUM VISIBILITY */}
      {submitting && <LoadingSpinner message="Uploading product files..." />}

      <div className="sma-root">
        {msg.show && (
          <MessageBox 
            message={msg.text} 
            type={msg.type} 
            onClose={() => setMsg({ ...msg, show: false })} 
          />
        )}
        
        <Sidebar />
        
        <main className="sma-main">
          <form className="sma-card" onSubmit={handleSubmit}>
            <h2 className="sma-title">➕ Add New Product</h2>
            
            <div className="sma-grid">
              <label className="sma-field">
                <span>Product Name *</span>
                <input 
                  className="sma-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </label>

              <label className="sma-field">
                <span>Your Price (₹) *</span>
                <input 
                  type="number" 
                  className="sma-input" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="Amount you receive" 
                  required 
                />
              </label>

              <label className="sma-field">
                <span>Final Listing Price (incl. Commission)</span>
                <input
                  type="text"
                  className="sma-input sma-readonly"
                  value={`₹ ${finalPrice}`}
                  readOnly
                />
              </label>

              <label className="sma-field">
                <span>Product Type *</span>
                <select 
                  className="sma-input" 
                  value={productType} 
                  onChange={(e) => { setProductType(e.target.value); setCategory(""); }} 
                  required
                >
                  <option value="">Select</option>
                  <option value="finished">Finished Interior Product</option>
                  <option value="material">Interior Material</option>
                </select>
              </label>

              <label className="sma-field">
                <span>Category *</span>
                <select 
                  className="sma-input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  disabled={!productType} 
                  required
                >
                  <option value="">Select</option>
                  {productType && productCategories[productType].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>

              {productType === "material" && (
                <>
                  <label className="sma-field">
                    <span>Measurement Unit *</span>
                    <select className="sma-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
                      <option value="pcs">Pieces (Pcs)</option>
                      <option value="sqft">Square Foot (Sq. Ft)</option>
                      <option value="sheet">Sheets</option>
                      <option value="metre">Metres (m)</option>
                      <option value="litre">Litres (L)</option>
                    </select>
                  </label>

                  {(unit === "sheet" || unit === "pcs") && (
                    <label className="sma-field">
                      <span>Sq. Ft per {unit === "sheet" ? "Sheet" : "Piece"} *</span>
                      <input
                        type="number"
                        step="0.01"
                        className="sma-input"
                        value={conversionFactor}
                        onChange={(e) => setConversionFactor(e.target.value)}
                        placeholder="e.g. 32 for an 8x4 sheet"
                      />
                    </label>
                  )}

                  <label className="sma-field">
                    <span>Units per Delivery Trip *</span>
                    <input 
                      type="number" 
                      className="sma-input" 
                      value={unitsPerTrip} 
                      onChange={(e) => setUnitsPerTrip(e.target.value)} 
                      min="1" 
                      placeholder="Max units in one vehicle" 
                      required 
                    />
                  </label>
                </>
              )}

              <label className="sma-field sma-full">
                <span>Detailed Description</span>
                <textarea 
                  className="sma-textarea" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Talk about materials, dimensions, and warranty..." 
                />
              </label>

              <label className="sma-field sma-full">
                <span>Upload Images (1–10)</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImages} 
                  className="sma-file" 
                />
                <div className="sma-preview-grid">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt="preview" className="sma-preview" />
                  ))}
                </div>
              </label>

              <label className="sma-field sma-full">
                <span>Upload Video (Max 30MB)</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideo} 
                  className="sma-file" 
                />
                {videoPreview && <video src={videoPreview} controls className="sma-preview" />}
              </label>
            </div>

            <button 
              type="submit" 
              className="sma-btn sma-btn--primary" 
              disabled={submitting}
            >
              {submitting ? "Finalising Upload..." : "Add Product to Store"}
            </button>
          </form>
        </main>
      </div>
    </>
  );
};

export default SellerAddProduct;