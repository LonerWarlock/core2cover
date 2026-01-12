"use client";

import React, { useState, useMemo, useEffect } from "react";
//import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
//import { PiVideoFill } from "react-icons/pi";
import { useRouter, useSearchParams } from "next/navigation"; // CHANGED
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";
import api from "../../api/axios";
import Image from "next/image";

const ProductInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  /* FETCH PRODUCT (Always fetch to ensure data integrity) */
  useEffect(() => {
    if (!productId) return;
    // Defer state updates to avoid synchronous setState in effect
    queueMicrotask(() => setLoading(true));

    api
      .get(`/product/${productId}`)
      .then((res) => setProduct(res.data || null))
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
  //const resolvedOrigin = origin || (seller?.business ? `${seller.business.city}, ${seller.business.state}` : "Not specified");

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

  /* MEDIA LIST (Remove localhost) */
  const mediaList = useMemo(() => {
    const list = [];
    images.forEach((img) =>
      list.push({
        type: "image",
        src: img.startsWith("http") ? img : `/${img}`, // CHANGED: Relative path
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

  const activeMedia = useMemo(
    () => (mediaList.length ? mediaList[0] : null),
    [mediaList]
  );
  const setActiveMedia = () => {
    // If you need to allow manual selection, keep this as a no-op or remove if not used elsewhere
  };

  /* ... Fullscreen / Video Logic remains same ... */
  // (Assuming standard React refs and state)

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
      .catch(() => {});
  }, [id]);

  /* ACTIONS */
  const handleBuyNow = () => {
    if (typeof window !== "undefined" && product) {
      // Use optional chaining (?.) and fallbacks to prevent "null" crashes
      localStorage.setItem(
        "singleCheckoutItem",
        JSON.stringify({
          materialId: id,
          supplierId: sellerId,
          name: title || product.name, // Use 'name' if 'title' is undefined
          supplier: resolvedSeller,
          amountPerTrip: price,
          trips: 1,
          image: images[0],

          // ACCESS NESTED DELIVERY DATA SAFELY
          shippingChargeType:
            product.seller?.delivery?.shippingChargeType || "Fixed",
          shippingCharge: product.seller?.delivery?.shippingCharge || 0,
          installationAvailable:
            product.seller?.delivery?.installationAvailable || "No",
          installationCharge: Number(
            product.seller?.delivery?.installationCharge || 0
          ),
        })
      );
      router.push("/checkout");
    }
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

      // ACCESS NESTED DELIVERY DATA SAFELY
      shippingChargeType:
        product.seller?.delivery?.shippingChargeType || "Fixed",
      shippingCharge: product.seller?.delivery?.shippingCharge || 0,
      installationAvailable:
        product.seller?.delivery?.installationAvailable || "No",
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
        {/* ... UI Layout remains same, ensure <img> src uses activeMedia.src ... */}
        <div className="pd-left">
          {/* Main Image Box */}
          <div
            className="pd-image-box"
            style={{ position: "relative", width: "100%", height: "400px" }}
          >
            {activeMedia?.type === "video" ? (
              <video src={activeMedia.src} controls className="pd-video" />
            ) : (
              <Image
                src={activeMedia?.src || sample.src}
                className="pd-image"
                alt="Product"
                fill
                style={{ objectFit: "cover" }}
              />
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="pd-thumbnails">
            {mediaList.map((m, i) => (
              <div
                key={i}
                className="pd-thumb-container"
                style={{ position: "relative", width: "80px", height: "80px" }}
              >
                <Image
                  src={m.src}
                  onClick={() => setActiveMedia(m)}
                  className="pd-thumb"
                  alt={`Product thumbnail ${i + 1}`}
                  fill
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pd-center">
          <h1>{title}</h1>

          {/* RATING DISPLAY START */}
          <div
            className="pd-rating-container"
            style={{ marginBottom: "10px", color: "#f39c12" }}
          >
            <span className="pd-rating-stars">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
            <span
              className="pd-rating-text"
              style={{ marginLeft: "8px", color: "#555", fontSize: "0.9rem" }}
            >
              ({avgRating.toFixed(1)}) | {ratingCount}{" "}
              {ratingCount === 1 ? "Review" : "Reviews"}
            </span>
          </div>
          {/* RATING DISPLAY END */}

          <p>{displayedDescription}</p>
          {isLongDescription && (
            <button onClick={() => setDescExpanded(!descExpanded)}>
              {descExpanded ? "Less" : "More"}
            </button>
          )}
          <hr />
          <p>Seller: {resolvedSeller}</p>
        </div>

        <div className="pd-right">
          <div className="pd-buybox">
            <p className="pd-price">₹{price.toLocaleString()}</p>
            <button className="pd-btn pd-btn-buy" onClick={handleBuyNow}>
              Buy Now
            </button>
            <button className="pd-btn pd-btn-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button
              className="pd-btn pd-btn-back"
              onClick={() => router.back()}
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
