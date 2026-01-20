"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";
import api from "../../api/axios";
import Image from "next/image";
import { FaArrowLeft, FaShareAlt, FaTimes, FaPlay, FaPause, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute, FaTruckLoading, FaRulerCombined } from "react-icons/fa";
import MessageBox from "../ui/MessageBox";

/* ---------------------------
    VideoPlayer — custom controls
   --------------------------- */
function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => setCurrent(v.currentTime || 0);
    const onEnded = () => setPlaying(false);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrent(t);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.volume === 0) {
      v.volume = 0.5;
      setVolume(0.5);
    }
  };

  const handleVolume = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const vol = Number(e.target.value);
    v.volume = vol;
    setVolume(vol);
    v.muted = vol === 0;
    setMuted(vol === 0);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => { });
      setIsFs(true);
    } else {
      await document.exitFullscreen().catch(() => { });
      setIsFs(false);
    }
  };

  const formatTime = (s = 0) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div ref={containerRef} className="custom-video-player" style={{ position: "relative", width: "100%", height: "100%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onClick={togglePlay}
      />
      <div style={{
        position: "absolute",
        left: 10,
        right: 10,
        bottom: 10,
        background: "linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))",
        padding: "8px 10px",
        borderRadius: 10,
        display: "flex",
        gap: 8,
        alignItems: "center"
      }}>
        <button onClick={togglePlay} aria-label="Play/Pause" style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18 }}>
          {playing ? <FaPause /> : <FaPlay />}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <input type="range" min={0} max={duration || 0} value={current} onChange={handleSeek} style={{ width: "100%" }} />
        </div>
        <div style={{ color: "#fff", fontSize: 12, minWidth: 48, textAlign: "center" }}>{formatTime(current)} / {formatTime(duration)}</div>
        <button onClick={toggleMute} aria-label="Mute" style={{ background: "transparent", border: "none", color: "#fff", fontSize: 16 }}>
          {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={handleVolume} style={{ width: 80 }} />
        <button onClick={toggleFullscreen} aria-label="Fullscreen" style={{ background: "transparent", border: "none", color: "#fff", fontSize: 16 }}>
          {isFs ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------
    ZoomableImage — pan & pinch & wheel
   --------------------------- */
function ZoomableImage({ src, alt, className }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastPointer = useRef({ active: false, x: 0, y: 0 });

  const transformStyle = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    touchAction: "none",
    cursor: scale > 1 ? "grab" : "auto",
    willChange: "transform"
  };

  const clamp = (val, a, b) => Math.max(a, Math.min(b, val));

  const getBounds = useCallback((s = scale) => {
    const c = containerRef.current;
    if (!c) return { maxX: 0, maxY: 0 };
    const cw = c.clientWidth;
    const ch = c.clientHeight;
    return { maxX: Math.max(0, (cw * s - cw) / 2), maxY: Math.max(0, (ch * s - ch) / 2) };
  }, [scale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onPointerDown = (e) => {
      container.setPointerCapture?.(e.pointerId);
      lastPointer.current = { active: true, id: e.pointerId, x: e.clientX, y: e.clientY };
      container.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!lastPointer.current.active || lastPointer.current.id !== e.pointerId) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current.x = e.clientX;
      lastPointer.current.y = e.clientY;
      setTranslate(prev => {
        const { maxX, maxY } = getBounds();
        return { x: clamp(prev.x + dx, -maxX, maxX), y: clamp(prev.y + dy, -maxY, maxY) };
      });
    };
    const onPointerUp = (e) => {
      lastPointer.current = { active: false, x: 0, y: 0 };
      container.style.cursor = scale > 1 ? "grab" : "auto";
      try { container.releasePointerCapture?.(e.pointerId); } catch { }
    };
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [getBounds, scale]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const onWheel = (e) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      const newScale = clamp(scale * (e.deltaY < 0 ? 1.08 : 0.92), 1, 4);
      setScale(newScale);
      setTranslate(prev => {
        const { maxX, maxY } = getBounds(newScale);
        return { x: clamp(prev.x, -maxX, maxX), y: clamp(prev.y, -maxY, maxY) };
      });
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [scale, getBounds]);

  return (
    <div ref={containerRef} className={className || "zoomable-img-container"} style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", touchAction: "none", background: "#000" }}>
      <img ref={imgRef} src={src} alt={alt || "Product"} draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none", ...transformStyle }} />
    </div>
  );
}

/* ---------------------------
    Main ProductInfo
   --------------------------- */
const ProductInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  const triggerMsg = (text, type = "success") => setMsg({ text, type, show: true });

  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/product/${productId}`)
      .then((res) => {
        setProduct(res.data || null);
        if (res.data?.images?.length > 0) {
          setSelectedMedia({ type: "image", src: res.data.images[0].startsWith("http") ? res.data.images[0] : `/${res.data.images[0]}` });
        } else if (res.data?.video) {
          setSelectedMedia({ type: "video", src: res.data.video.startsWith("http") ? res.data.video : `/${res.data.video}` });
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const { id, sellerId, title = "", seller = "", price = 0, images = [], video = null, description = "", productType = "finished", unit = "pcs", unitsPerTrip = 1, conversionFactor = 1 } = product || {};
  const resolvedSeller = typeof seller === "string" ? seller : seller?.name || "Not specified";

  const descriptionWords = useMemo(() => (description ? description.trim().split(/\s+/).filter(Boolean) : []), [description]);
  const isLongDescription = descriptionWords.length > 20;
  const displayedDescription = descExpanded ? description : isLongDescription ? descriptionWords.slice(0, 20).join(" ") + "..." : description;

  const mediaList = useMemo(() => {
    const list = [];
    images.forEach((img) => list.push({ type: "image", src: img.startsWith("http") ? img : `/${img}` }));
    if (video) list.push({ type: "video", src: video.startsWith("http") ? video : `/${video}` });
    return list;
  }, [images, video]);

  const activeMedia = selectedMedia || (mediaList.length ? mediaList[0] : null);

  /* Logistics Calculations */
  const tripCount = useMemo(() => Math.ceil(quantity / unitsPerTrip), [quantity, unitsPerTrip]);
  const totalCoverage = useMemo(() => (quantity * conversionFactor).toFixed(2), [quantity, conversionFactor]);
  const totalPrice = useMemo(() => {
    const materialCost = quantity * price;
    const shippingCost = product?.shippingChargeType === "Paid" ? tripCount * product.shippingCharge : 0;
    return materialCost + shippingCost;
  }, [quantity, price, tripCount, product]);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    api.get(`/product/${id}/ratings`).then((res) => {
      setAvgRating(res.data.avgRating || 0);
      setRatingCount(res.data.count || 0);
      setReviews(res.data.reviews || []);
    }).catch(() => { });
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;

    // Create the checkout item using fetched database values
    const checkoutItem = {
      materialId: product.id,
      supplierId: product.sellerId,
      name: product.name,
      supplier: resolvedSeller,
      amountPerTrip: Number(product.price),
      image: product.images?.[0] || "",

      // FETCHED FROM DB
      unitsPerTrip: product.unitsPerTrip,
      shippingCharge: Number(product.shippingCharge),
      shippingChargeType: product.shippingChargeType || "Paid",
      installationAvailable: product.installationAvailable || "no",
      installationCharge: Number(product.installationCharge || 0),

      quantity: quantity,
      unit: product.unit,
      conversionFactor: product.conversionFactor,
      // Calculate initial trips for the checkout page
      trips: Math.ceil(quantity / product.unitsPerTrip)
    };

    localStorage.setItem("singleCheckoutItem", JSON.stringify(checkoutItem));
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      materialId: id, supplierId: sellerId, name: title || product.name,
      supplier: resolvedSeller, amountPerTrip: Number(price), trips: tripCount, image: images[0],
      shippingChargeType: product.shippingChargeType || "Paid", shippingCharge: Number(product.shippingCharge || 0),
      installationAvailable: product.installationAvailable || "yes", installationCharge: Number(product.installationCharge || 0),
      quantity: quantity, unit, conversionFactor, unitsPerTrip
    });
    triggerMsg(`${title} added to cart!`, "success");
  };

  if (loading) return <><Navbar /><div className="pd-loading">Loading product details...</div></>;
  if (!product) return <><Navbar /><div className="pd-not-found">Product not found</div></>;

  return (
    <>
      <Navbar />
      {msg.show && <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />}
      <div className="pd-container">
        <div className="pd-top-nav">
          <button className="back-btn" onClick={() => router.back()}><FaArrowLeft /> Back</button>
        </div>
        <div className="pd-left">
          <div className="pd-image-box" onClick={openFullscreen} style={{ position: "relative", height: 420 }}>
            {activeMedia?.type === "video" ? <VideoPlayer src={activeMedia.src} poster={images?.[0]} /> : <ZoomableImage src={activeMedia?.src || sample.src} alt={title} />}
          </div>
          <div className="pd-thumbnails" style={{ marginTop: 14 }}>
            {mediaList.map((m, i) => (
              <div key={i} className={`pd-thumb-container ${activeMedia?.src === m.src ? "active-thumb" : ""}`} onClick={() => setSelectedMedia(m)} style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: activeMedia?.src === m.src ? "2px solid #4e5a44" : "1px solid #ddd", marginRight: 10, display: "inline-block", cursor: "pointer" }}>
                {m.type === "video" ? <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}><video src={m.src + "#t=0.1"} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", left: 6, top: 6, color: "#fff" }}><FaPlay /></div></div> : <div style={{ position: 'relative', width: '100%', height: '100%' }}><Image src={m.src} alt={`thumb-${i}`} fill style={{ objectFit: "cover" }} /></div>}
              </div>
            ))}
          </div>
        </div>
        <div className="pd-center">
          <h1 className="pd-title">{title}</h1>
          <div className="pd-rating-container">
            <span className="pd-stars">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</span>
            <span className="pd-rating-count" style={{ marginLeft: 10 }}>({avgRating.toFixed(1)}) • {ratingCount} Reviews</span>
          </div>
          <div className="pd-description-box">
            <p className="pd-description-text">Description: {displayedDescription}</p>
            {isLongDescription && <button onClick={() => setDescExpanded(!descExpanded)} className="read-more-btn">{descExpanded ? "Show Less" : "Read More"}</button>}
          </div>

          {/* Logistics Interface */}
          {productType === "material" && (
            <div className="pd-logistics-panel">
              <h3 className="pd-logistics-title">Logistics & Coverage</h3>
              <div className="pd-logistics-grid">
                <div className="pd-input-group">
                  <label className="pd-input-label">Quantity ({unit})</label>
                  <input
                    type="number"
                    min="1"
                    className="pd-quantity-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div className="pd-coverage-display">
                  <span className="pd-input-label">Total Coverage</span>
                  <p className="pd-coverage-value">{totalCoverage} Sq. Ft</p>
                </div>
              </div>
              <div className="pd-trip-estimator">
                <FaTruckLoading />
                <span>Requires <strong className="pd-trip-highlight">{tripCount}</strong> delivery trip(s)</span>
              </div>
            </div>
          )}

          <hr className="pd-divider" />
          <p className="pd-seller-info">Sold by: <span className="pd-seller-name">{resolvedSeller}</span></p>
        </div>
        <div className="pd-right">
          <div className="pd-buybox">
            <p className="pd-price">₹{price.toLocaleString()} <span className="pd-price-unit">/ {unit}</span></p>
            <p className="pd-tax-info">Inclusive of all taxes</p>
            <p className="pd-total-preview">Subtotal: ₹{totalPrice.toLocaleString()}</p>
            <button className="pd-btn-share-icon" onClick={() => triggerMsg("Link copied!", "success")} style={{ width: 44, height: 44, borderRadius: 10, border: "none", marginTop: 12 }}><FaShareAlt /></button>
            <button className="pd-btn pd-btn-buy" onClick={handleBuyNow} style={{ marginTop: 10 }}>Buy Now</button>
            <button className="pd-btn pd-btn-cart" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      </div>

      <section className="pd-reviews-section">
        <div className="pd-reviews-container">
          <h2 className="pd-section-title">Customer Reviews</h2>
          <div className="pd-reviews-layout">
            <div className="pd-rating-summary">
              <div className="pd-summary-card">
                <div className="pd-summary-header">
                  <span className="pd-big-rating">{avgRating.toFixed(1)}</span>
                  <div className="pd-summary-stars">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</div>
                </div>
                <p className="pd-summary-total">{ratingCount} global ratings</p>
              </div>
            </div>
            <div className="pd-reviews-list">
              <h3 className="pd-list-heading">Top reviews from India</h3>
              {reviews.length > 0 ? reviews.map((review, index) => (
                <div key={index} className="pd-review-card">
                  <div className="pd-review-user">
                    <div className="pd-user-avatar">{review.userName?.charAt(0) || "U"}</div>
                    <span className="pd-user-name">{review.userName || "Verified Customer"}</span>
                  </div>
                  <div className="pd-review-meta">
                    <span className="pd-review-stars">{"★".repeat(review.stars)}</span>
                    <span className="pd-review-headline">Verified Purchase</span>
                  </div>
                  <p className="pd-review-body">{review.comment || review.review}</p>
                </div>
              )) : <div className="pd-no-reviews">No reviews yet.</div>}
            </div>
          </div>
        </div>
      </section>

      {isFullscreen && (
        <div className="pd-fullscreen-overlay" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button className="pd-fullscreen-close" onClick={closeFullscreen} style={{ position: "absolute", top: 20, right: 20, zIndex: 10010, background: "transparent", color: "#fff", border: "none", fontSize: 22 }}><FaTimes /></button>
          <div style={{ width: "92%", height: "92%", position: "relative" }}>
            {activeMedia?.type === "video" ? <VideoPlayer src={activeMedia.src} /> : <ZoomableImage src={activeMedia?.src || sample.src} alt={title} />}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ProductInfo;