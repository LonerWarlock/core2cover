"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";
import api from "../../api/axios";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa"; // Imported for the back button icon

const ProductInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null); // Added state for thumbnail selection

  /* FETCH PRODUCT */
  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    api
      .get(`/product/${productId}`)
      .then((res) => {
        setProduct(res.data || null);
        // Set initial media if available
        if (res.data?.images?.length > 0) {
          setSelectedMedia({
            type: "image",
            src: res.data.images[0].startsWith("http") ? res.data.images[0] : `/${res.data.images[0]}`
          });
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  /* SAFE DEFAULTS */
  const {
    id,
    sellerId,
    title = "",
    seller = "",
    price = 0,
    images = [],
    video = null,
    description = "",
  } = product || {};

  const resolvedSeller =
    typeof seller === "string" ? seller : seller?.name || "Not specified";

  /* DESCRIPTION LOGIC */
  const descriptionWords = useMemo(
    () => (description ? description.trim().split(/\s+/).filter(Boolean) : []),
    [description]
  );
  const isLongDescription = descriptionWords.length > 20;
  const displayedDescription = descExpanded
    ? description
    : isLongDescription
      ? descriptionWords.slice(0, 20).join(" ") + "..."
      : description;

  /* MEDIA LIST */
  const mediaList = useMemo(() => {
    const list = [];
    images.forEach((img) =>
      list.push({
        type: "image",
        src: img.startsWith("http") ? img : `/${img}`,
      })
    );
    if (video) {
      list.push({
        type: "video",
        src: video.startsWith("http") ? video : `/${video}`,
      });
    }
    return list;
  }, [images, video]);

  // Use selectedMedia if user clicked a thumb, otherwise use first in list
  const activeMedia = selectedMedia || (mediaList.length ? mediaList[0] : null);

  /* REVIEWS */
  const [, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/product/${id}/ratings`)
      .then((res) => {
        setAvgRating(res.data.avgRating || 0);
        setRatingCount(res.data.count || 0);
        setReviews(res.data.reviews || []);
      })
      .catch(() => { });
  }, [id]);

  /* ACTIONS */
  const handleBuyNow = () => {
    if (!product) return;

    const checkoutItem = {
      materialId: product.id,
      supplierId: product.sellerId,
      name: product.title, // API returns product.name as 'title'
      supplier: product.seller,
      amountPerTrip: Number(product.price),
      image: product.images?.[0] || "",

      // FIX: Map directly from the product object (already flattened by API)
      shippingChargeType: product.shippingChargeType || "free",
      shippingCharge: Number(product.shippingCharge || 0),
      installationAvailable: product.installationAvailable || "no",
      installationCharge: Number(product.installationCharge || 0),

      quantity: 1,
    };

    localStorage.setItem("singleCheckoutItem", JSON.stringify(checkoutItem));
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      materialId: id,
      supplierId: sellerId,
      name: title || product.name,
      supplier: resolvedSeller,
      amountPerTrip: price,
      trips: 1,
      image: images[0],
      shippingChargeType: product.seller?.delivery?.shippingChargeType || "Fixed",
      shippingCharge: product.seller?.delivery?.shippingCharge || 0,
      installationAvailable: product.seller?.delivery?.installationAvailable || "No",
      installationCharge: product.seller?.delivery?.installationCharge || 0,
    });
    alert("Added to cart");
  };

  if (loading)
    return (
      <>
        <Navbar />
        <p style={{ padding: 80 }}>Loading...</p>
      </>
    );

  if (!product)
    return (
      <>
        <Navbar />
        <p style={{ padding: 80 }}>Product not found</p>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="pd-container">

        {/* TOP BACK BUTTON */}
        <div className="pd-top-nav" style={{ gridColumn: "1 / -1", marginBottom: "20px" }}>
          <button className="back-btn" onClick={() => router.back()}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="pd-left">
          {/* Main Image Box */}
          <div
            className="pd-image-box"
            style={{ position: "relative", width: "100%", height: "400px", background: "#f9f9f9", borderRadius: "12px", overflow: "hidden" }}
          >
            {activeMedia?.type === "video" ? (
              <video src={activeMedia.src} controls className="pd-video" style={{ width: "100%", height: "100%" }} />
            ) : (
              <Image
                src={activeMedia?.src || sample.src}
                className="pd-image"
                alt="Product"
                fill
                style={{ objectFit: "contain" }}
              />
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="pd-thumbnails" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            {mediaList.map((m, i) => (
              <div
                key={i}
                className={`pd-thumb-container ${activeMedia?.src === m.src ? "active-thumb" : ""}`}
                onClick={() => setSelectedMedia(m)}
                style={{
                  position: "relative",
                  width: "80px",
                  height: "80px",
                  cursor: "pointer",
                  border: activeMedia?.src === m.src ? "2px solid var(--green-dark)" : "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}
              >
                <Image
                  src={m.src}
                  className="pd-thumb"
                  alt={`Product thumbnail ${i + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pd-center">
          <h1 style={{ fontFamily: "var(--font-accent)", color: "var(--green-dark)" }}>{title}</h1>

          {/* RATING DISPLAY */}
          <div className="pd-rating-container" style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
            <span style={{ color: "#f39c12", fontSize: "1.2rem" }}>
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
            <span style={{ marginLeft: "10px", color: "#6b7280", fontSize: "0.95rem" }}>
              ({avgRating.toFixed(1)}) • {ratingCount} {ratingCount === 1 ? "Review" : "Reviews"}
            </span>
          </div>

          <div className="pd-description-box">
            <p style={{ lineHeight: "1.6", color: "#474747" }}>{displayedDescription}</p>
            {isLongDescription && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                style={{ background: "none", border: "none", color: "var(--green-mid)", fontWeight: "bold", cursor: "pointer", padding: 0 }}
              >
                {descExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>

          <hr style={{ margin: "25px 0", opacity: "0.1" }} />
          <p style={{ fontSize: "0.9rem", color: "#8f8b84" }}>
            Sold by: <span style={{ color: "var(--green-dark)", fontWeight: "600" }}>{resolvedSeller}</span>
          </p>
        </div>

        <div className="pd-right">
          <div className="pd-buybox">
            <p className="pd-price">₹{price.toLocaleString()}</p>
            <p style={{ fontSize: "0.8rem", color: "#8f8b84", marginBottom: "20px" }}>Inclusive of all taxes</p>

            <button className="pd-btn pd-btn-buy" onClick={handleBuyNow}>
              Buy Now
            </button>
            <button className="pd-btn pd-btn-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>

            {/* IN-BOX BACK BUTTON AS WELL */}
            <button
              className="pd-btn pd-btn-back"
              onClick={() => router.back()}
              style={{ marginTop: "10px", background: "#f3f4f6", color: "#4b5563" }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductInfo;