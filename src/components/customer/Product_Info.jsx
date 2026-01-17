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
import { FaArrowLeft, FaShareAlt, FaTimes } from "react-icons/fa";
import MessageBox from "../ui/MessageBox"; // Ensure path is correct

const ProductInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = React.useRef(null);

  // MessageBox State
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* FULLSCREEN LOGIC */
  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    if (isFullscreen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen]);

  /* FETCH PRODUCT */
  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    api
      .get(`/product/${productId}`)
      .then((res) => {
        setProduct(res.data || null);
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

  const resolvedSeller = typeof seller === "string" ? seller : seller?.name || "Not specified";

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

  const activeMedia = selectedMedia || (mediaList.length ? mediaList[0] : null);

  /* REVIEWS STATE */
  const [reviews, setReviews] = useState([]);
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
      name: product.title,
      supplier: product.seller,
      amountPerTrip: Number(product.price),
      image: product.images?.[0] || "",
      shippingChargeType: product.shippingChargeType || "free",
      shippingCharge: Number(product.shippingCharge || 0),
      installationAvailable: product.installationAvailable || "no",
      installationCharge: Number(product.installationCharge || 0),
      quantity: 1,
    };
    localStorage.setItem("singleCheckoutItem", JSON.stringify(checkoutItem));
    router.push("/checkout");
  };

  // Inside ProductInfo.jsx
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      materialId: id,
      supplierId: sellerId,
      name: title || product.name,
      supplier: resolvedSeller,
      amountPerTrip: Number(price),
      trips: 1,
      image: images[0],
      // Ensure these fields exist so Cart.jsx doesn't default them to 0
      shippingChargeType: product.shippingChargeType || "Paid",
      shippingCharge: Number(product.shippingCharge || 0),
      installationAvailable: product.installationAvailable || "yes",
      installationCharge: Number(product.installationCharge || 0),
    });
    triggerMsg(`${title} added to cart successfully!`, "success");
  };
  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} on Core2Cover!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await api.patch(`/product/${productId}`);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        triggerMsg("Link copied to clipboard!", "success");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
        triggerMsg("Could not share product.", "error");
      }
    }
  };

  if (loading) return <><Navbar /><p style={{ padding: 80 }}>Loading...</p></>;
  if (!product) return <><Navbar /><p style={{ padding: 80 }}>Product not found</p></>;

  return (
    <>
      <Navbar />

      {/* MessageBox Integration */}
      {msg.show && (
        <MessageBox
          message={msg.text}
          type={msg.type}
          onClose={() => setMsg({ ...msg, show: false })}
        />
      )}

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
            onClick={openFullscreen}
            style={{ position: "relative", width: "100%", height: "400px", cursor: "zoom-in" }}
          >
            {activeMedia?.type === "video" ? (
              <video src={activeMedia.src} controls className="pd-video" />
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
                  position: "relative", width: "80px", height: "80px", cursor: "pointer",
                  border: activeMedia?.src === m.src ? "2px solid var(--green-dark)" : "1px solid #ddd",
                  borderRadius: "8px", overflow: "hidden"
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
            <p style={{ lineHeight: "1.6", color: "#474747" }}>Description: {displayedDescription}</p>
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

            <button
              className="pd-btn pd-btn-share"
              onClick={handleShare}
              style={{ width: "50px", background: "#f3f4f6", color: "var(--green-dark)", display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <FaShareAlt />
            </button>

            <button className="pd-btn pd-btn-buy" onClick={handleBuyNow}>Buy Now</button>
            <button className="pd-btn pd-btn-cart" onClick={handleAddToCart}>Add to Cart</button>
            <button className="pd-btn pd-btn-back" onClick={() => router.back()} style={{ marginTop: "10px", background: "#f3f4f6", color: "#4b5563" }}>Go Back</button>
          </div>
        </div>
      </div>

      {/* RATINGS & REVIEWS SECTION */}
      <section className="pd-reviews-section">
        <div className="pd-reviews-container">
          <h2 className="pd-section-title">Customer Reviews</h2>

          <div className="pd-reviews-layout">
            <div className="pd-rating-summary">
              <div className="pd-summary-card">
                <div className="pd-summary-header">
                  <span className="pd-big-rating">{avgRating.toFixed(1)}</span>
                  <div className="pd-summary-stars">
                    {"★".repeat(Math.round(avgRating))}
                    {"☆".repeat(5 - Math.round(avgRating))}
                  </div>
                </div>
                <p className="pd-summary-total">{ratingCount} global ratings</p>

                <div className="pd-rating-bars">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="pd-bar-row">
                      <span>{star} star</span>
                      <div className="pd-bar-bg">
                        <div
                          className="pd-bar-fill"
                          style={{ width: ratingCount > 0 ? `${(reviews.filter(r => r.stars === star).length / ratingCount) * 100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pd-reviews-list">
              <h3 className="pd-list-heading">Top reviews from India</h3>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="pd-review-card">
                    <div className="pd-review-user">
                      <div className="pd-user-avatar">
                        {review.userName?.charAt(0) || "U"}
                      </div>
                      <span className="pd-user-name">{review.userName || "Verified Customer"}</span>
                    </div>

                    <div className="pd-review-meta">
                      <span className="pd-review-stars">{"★".repeat(review.stars)}</span>
                      <span className="pd-review-headline">Verified Purchase</span>
                    </div>

                    <p className="pd-review-date">
                      {review.createdAt ? (
                        <>
                          Reviewed on {(() => {
                            const date = new Date(review.createdAt);
                            // Check if the date object is valid
                            return isNaN(date.getTime())
                              ? "Recent Date"
                              : date.toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              });
                          })()}
                        </>
                      ) : (
                        "Reviewed recently"
                      )}
                    </p>

                    <p className="pd-review-body">{review.comment || review.review}</p>
                  </div>
                ))
              ) : (
                <div className="pd-no-reviews">
                  <p>There are no reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FULLSCREEN OVERLAY */}
      {isFullscreen && (
        <div className="pd-fullscreen-overlay" ref={fullscreenRef}>
          <button className="pd-fullscreen-close" onClick={closeFullscreen}><FaTimes /></button>
          <div className="pd-fullscreen-content">
            {activeMedia?.type === "video" ? (
              <video src={activeMedia.src} controls autoPlay className="pd-fullscreen-media" />
            ) : (
              <Image src={activeMedia?.src || sample.src} alt="Fullscreen Product" fill style={{ objectFit: "contain" }} />
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ProductInfo;