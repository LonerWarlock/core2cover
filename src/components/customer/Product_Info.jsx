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
import { FaArrowLeft, FaShareAlt, FaTimes, FaPlay, FaPause, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute, FaTruckLoading, FaRulerCombined, FaStore } from "react-icons/fa";
import MessageBox from "../ui/MessageBox";
import LoadingSpinner from "../ui/LoadingSpinner";

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
        v.paused ? (v.play(), setPlaying(true)) : (v.pause(), setPlaying(false));
    };

    const handleSeek = (e) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = Number(e.target.value);
        setCurrent(v.currentTime);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setMuted(videoRef.current.muted);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
            setIsFs(true);
        } else {
            await document.exitFullscreen();
            setIsFs(false);
        }
    };

    const formatTime = (s = 0) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    return (
        <div ref={containerRef} className="custom-video-player" style={{ position: "relative", width: "100%", height: "100%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <video ref={videoRef} src={src} poster={poster} style={{ width: "100%", height: "100%", objectFit: "contain" }} onClick={togglePlay} />
            <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, background: "rgba(0,0,0,0.5)", padding: "8px 10px", borderRadius: 10, display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={togglePlay} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18 }}>{playing ? <FaPause /> : <FaPlay />}</button>
                <input type="range" min={0} max={duration || 0} value={current} onChange={handleSeek} style={{ flex: 1 }} />
                <div style={{ color: "#fff", fontSize: 12 }}>{formatTime(current)} / {formatTime(duration)}</div>
                <button onClick={toggleMute} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 16 }}>{muted ? <FaVolumeMute /> : <FaVolumeUp />}</button>
                <button onClick={toggleFullscreen} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 16 }}><FaExpand /></button>
            </div>
        </div>
    );
}

/* ---------------------------
    ZoomableImage — Pan & Move Logic
    --------------------------- */
function ZoomableImage({ src, alt, className }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const lastPointer = useRef({ active: false, x: 0, y: 0 });

    const transformStyle = {
        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        touchAction: "none",
        cursor: scale > 1 ? "grab" : "auto",
        willChange: "transform",
        transition: lastPointer.current.active ? "none" : "transform 0.2s ease-out"
    };

    const clamp = (val, a, b) => Math.max(a, Math.min(b, val));

    const getBounds = useCallback((s = scale) => {
        const c = containerRef.current;
        if (!c) return { maxX: 0, maxY: 0 };
        const cw = c.clientWidth;
        const ch = c.clientHeight;
        // Calculate the maximum allowed movement based on current zoom level
        return { 
            maxX: Math.max(0, (cw * s - cw) / 2), 
            maxY: Math.max(0, (ch * s - ch) / 2) 
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
        const newScale = clamp(scale * (e.deltaY < 0 ? 1.15 : 0.85), 1, 4);
        setScale(newScale);
        if (newScale === 1) setTranslate({ x: 0, y: 0 });
    };

    return (
        <div 
            ref={containerRef} 
            className={className || "zoomable-img-container"} 
            style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", touchAction: "none", background: "#000" }}
            onWheel={onWheel}
        >
            <img 
                src={src} 
                alt={alt || "Product"} 
                draggable={false} 
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none", ...transformStyle }} 
            />
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "success", show: false });

    const triggerMsg = (text, type = "success") => setMsg({ text, type, show: true });
    const openFullscreen = () => setIsFullscreen(true);
    const closeFullscreen = () => setIsFullscreen(false);

    const decodePayload = (payload) => {
        try { return JSON.parse(atob(payload)); } catch (e) { return null; }
    };

    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        api.get(`/product/${productId}`)
            .then((res) => {
                const data = res.data?.payload ? decodePayload(res.data.payload) : res.data;
                setProduct(data || null);
                if (data?.images?.length > 0) {
                    setSelectedMedia({ type: "image", src: data.images[0].startsWith("http") ? data.images[0] : `/${data.images[0]}` });
                }
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const { 
        id, sellerId, title, name, seller, price, images = [], video = null, 
        description, productType, unit, unitsPerTrip, conversionFactor, availability 
    } = product || {};

    const displayTitle = title || name || "Product Details";
    const resolvedSeller = typeof seller === "string" ? seller : (seller?.name || "Verified Seller");
    const displayDescription = description || "No description provided for this product.";

    const mediaList = useMemo(() => {
        const list = [];
        images.forEach((img) => list.push({ type: "image", src: img.startsWith("http") ? img : `/${img}` }));
        if (video) list.push({ type: "video", src: video.startsWith("http") ? video : `/${video}` });
        return list;
    }, [images, video]);

    const activeMedia = selectedMedia || (mediaList.length ? mediaList[0] : null);

    const tripCount = useMemo(() => {
        const q = Number(quantity) || 0;
        const upt = Number(unitsPerTrip) || 1;
        return q === 0 ? 0 : Math.ceil(q / upt);
    }, [quantity, unitsPerTrip]);

    const totalCoverage = useMemo(() => {
        const q = Number(quantity) || 0;
        const cf = Number(conversionFactor) || 1;
        return (q * cf).toFixed(2);
    }, [quantity, conversionFactor]);

    const totalPrice = useMemo(() => {
        const q = Number(quantity) || 0;
        const p = Number(price) || 0;
        const materialCost = q * p;
        const shippingCost = product?.shippingChargeType === "Paid" ? tripCount * (product.shippingCharge || 0) : 0;
        return materialCost + shippingCost;
    }, [quantity, price, tripCount, product]);

    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);

    useEffect(() => {
        if (!id) return;
        api.get(`/product/${id}/ratings`).then((res) => {
            const data = res.data?.payload ? decodePayload(res.data.payload) : res.data;
            setAvgRating(data?.avgRating || 0);
            setRatingCount(data?.count || 0);
            setReviews(data?.reviews || []);
        }).catch(() => { });
    }, [id]);

    const handleBuyNow = () => {
        if (availability === "out_of_stock") return triggerMsg("Item out of stock.", "error");
        setIsProcessing(true);
        const checkoutItem = {
            materialId: id, supplierId: sellerId, name: displayTitle, supplier: resolvedSeller,
            amountPerTrip: Number(price), image: images[0] || "", unitsPerTrip,
            shippingCharge: Number(product?.shippingCharge || 0), shippingChargeType: product?.shippingChargeType || "Paid",
            installationAvailable: product?.installationAvailable || "no", installationCharge: Number(product?.installationCharge || 0),
            quantity: Number(quantity), unit, conversionFactor, trips: tripCount
        };
        localStorage.setItem("singleCheckoutItem", btoa(JSON.stringify(checkoutItem)));
        router.push("/checkout");
    };

    const handleAddToCart = () => {
        if (availability === "out_of_stock") return triggerMsg("Item out of stock.", "error");
        addToCart({
            materialId: id, supplierId: sellerId, name: displayTitle, supplier: resolvedSeller,
            amountPerTrip: Number(price), trips: tripCount, image: images[0],
            shippingChargeType: product?.shippingChargeType || "Paid", shippingCharge: Number(product?.shippingCharge || 0),
            installationAvailable: product?.installationAvailable || "yes", installationCharge: Number(product?.installationCharge || 0),
            quantity: quantity, unit, conversionFactor, unitsPerTrip
        });
        triggerMsg(`${displayTitle} added to cart!`, "success");
    };

    if (loading) return <LoadingSpinner message="Loading Product..." />;
    if (!product) return <div className="pd-not-found">Product not found</div>;

    // LITRE LOGIC: Detect if unit is liquid
    const isLiquid = unit?.toLowerCase() === "litre" || unit?.toLowerCase() === "ml" || unit?.toLowerCase() === "liter";

    return (
        <>
            <Navbar />
            {isProcessing && <LoadingSpinner message="Preparing your order..." />}
            {msg.show && <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />}
            
            <div className="pd-container">
                <div className="pd-top-nav">
                    <button className="back-btn" onClick={() => router.back()}><FaArrowLeft /> Back</button>
                </div>

                <div className="pd-left">
                    <div className="pd-image-box" onClick={openFullscreen} style={{ position: "relative", height: 420 }}>
                        {activeMedia?.type === "video" ? <VideoPlayer src={activeMedia.src} poster={images?.[0]} /> : <ZoomableImage src={activeMedia?.src || sample.src} alt={displayTitle} />}
                    </div>
                    <div className="pd-thumbnails" style={{ marginTop: 14 }}>
                        {mediaList.map((m, i) => (
                            <div key={i} className={`pd-thumb-container ${activeMedia?.src === m.src ? "active-thumb" : ""}`} onClick={() => setSelectedMedia(m)} style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: activeMedia?.src === m.src ? "2px solid #4e5a44" : "1px solid #ddd", marginRight: 10, display: "inline-block", cursor: "pointer" }}>
                                {m.type === "video" ? <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}><FaPlay style={{color: '#fff'}} /></div> : <div style={{ position: 'relative', width: '100%', height: '100%' }}><Image src={m.src} alt="thumb" fill style={{ objectFit: "cover" }} /></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pd-center">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1 className="pd-title">{displayTitle}</h1>
                        <span className={`availability-badge ${availability}`}>{availability?.replace('_', ' ')}</span>
                    </div>

                    <div className="pd-rating-container">
                        <span className="pd-stars">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</span>
                        <span className="pd-rating-count" style={{ marginLeft: 10 }}>({avgRating.toFixed(1)}) • {ratingCount} Reviews</span>
                    </div>

                    <div className="pd-description-box">
                        <p className="pd-description-text"><strong>Description:</strong> {displayDescription}</p>
                        {description?.length > 100 && <button onClick={() => setDescExpanded(!descExpanded)} className="read-more-btn">{descExpanded ? "Show Less" : "Read More"}</button>}
                    </div>

                    {/* CALCULATION PART - Dynamic Unit Logic */}
                    {(productType?.toLowerCase().includes("material") || productType === "Raw Material") && (
                        <div className="pd-logistics-panel">
                            <h3 className="pd-logistics-title">Logistics & {isLiquid ? "Volume" : "Coverage"}</h3>
                            <div className="pd-logistics-grid">
                                <div className="pd-input-group">
                                    <label className="pd-input-label">Quantity ({unit || 'pcs'})</label>
                                    <input type="number" min="1" className="pd-quantity-input" value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} disabled={availability === "out_of_stock"} />
                                </div>
                                <div className="pd-coverage-display">
                                    <span className="pd-input-label">Total {isLiquid ? "Volume" : "Coverage"}</span>
                                    <p className="pd-coverage-value">{totalCoverage} {isLiquid ? unit : "Sq. Ft"}</p>
                                </div>
                            </div>
                            <div className="pd-trip-estimator">
                                <FaTruckLoading /> <span>Requires <strong className="pd-trip-highlight">{tripCount}</strong> delivery trip(s)</span>
                            </div>
                        </div>
                    )}

                    <hr className="pd-divider" />
                    
                    <div className="pd-seller-section" style={{ marginTop: '15px' }}>
                        <p className="pd-seller-info">
                            <FaStore style={{ marginRight: '8px', color: '#4e5a44' }} />
                            Sold by: <span className="pd-seller-name" style={{ fontWeight: '600' }}>{resolvedSeller}</span>
                        </p>
                    </div>
                </div>

                <div className="pd-right">
                    <div className="pd-buybox">
                        <p className="pd-price">₹{Number(price || 0).toLocaleString()} <span className="pd-price-unit">/ {unit || 'pcs'}</span></p>
                        <p className="pd-tax-info">Inclusive of all taxes</p>
                        <p className="pd-total-preview">Subtotal: ₹{totalPrice.toLocaleString()}</p>
                        <button className="pd-btn pd-btn-buy" onClick={handleBuyNow} disabled={availability === "out_of_stock"}>Buy Now</button>
                        <button className="pd-btn pd-btn-cart" onClick={handleAddToCart} disabled={availability === "out_of_stock"}>Add to Cart</button>
                        <button className="pd-btn-share-icon" onClick={() => triggerMsg("Link copied!", "success")} style={{ width: "100%", borderRadius: 10, border: "1px solid #ddd", marginTop: 12, padding: "10px", background: "#fff" }}><FaShareAlt /> Share Product</button>
                    </div>
                </div>
            </div>

            {/* REVIEWS SECTION */}
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
                        {activeMedia?.type === "video" ? <VideoPlayer src={activeMedia.src} /> : <ZoomableImage src={activeMedia?.src || sample.src} alt={displayTitle} />}
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
};

export default ProductInfo;