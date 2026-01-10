import React, {
  useState,
  useMemo,
  useEffect,
  useRef
} from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { PiVideoFill } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";
import api from "../../api/axios";

/* ===============================
   HELPERS
=============================== */
const formatAvailability = (value) => {
  switch (value) {
    case "available": return "Available";
    case "out_of_stock": return "Out of Stock";
    case "low_stock": return "Low Stock";
    case "discontinued": return "Discontinued";
    default: return "Available";
  }
};

const pickCartImage = (images) =>
  Array.isArray(images) && images.length
    ? images[0].startsWith("http")
      ? images[0]
      : `http://localhost:3001/${images[0]}`
    : null;

const renderStars = (rating = 0) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push(<FaStar key={i} />);
    else if (i === full + 1 && half)
      stars.push(<FaStarHalfAlt key={i} />);
    else stars.push(<FaRegStar key={i} />);
  }
  return stars;
};

const ProductInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const productId = query.get("id");

  /* ===============================
     STATE
  =============================== */
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);

  // description toggle state
  const [descExpanded, setDescExpanded] = useState(false);

  /* ===============================
     FETCH PRODUCT
  =============================== */
  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    api.get(`/product/${productId}`)
      .then(res => setProduct(res.data || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);


  /* ===============================
     SAFE DEFAULTS
  =============================== */
  const {
    id,
    sellerId,
    title = "",
    seller = "",
    origin = "",
    price = 0,
    images = [],
    video = null,
    description = "",
    availability = "available"
  } = product || {};

  /* ✅ SAFE RESOLUTION (ONLY FIX) */
  const resolvedSeller =
    typeof seller === "string"
      ? seller
      : seller?.name || "Not specified";

  const resolvedOrigin =
    origin ||
    (seller?.business
      ? `${seller.business.city}, ${seller.business.state}`
      : "Not specified");


  /* ===============================
     DESCRIPTION LOGIC (20 words)
  =============================== */
  const descriptionWords = useMemo(() => {
    if (!description) return [];
    return description.trim().split(/\s+/).filter(Boolean);
  }, [description]);

  const isLongDescription = descriptionWords.length > 10;

  const shortDescription = isLongDescription
    ? descriptionWords.slice(0, 15).join(" ") + "..."
    : description;

  const displayedDescription = descExpanded ? description : shortDescription;

  const toggleDescription = () => {
    setDescExpanded((s) => !s);
  };


  /* ===============================
     MEDIA
  =============================== */
  const mediaList = useMemo(() => {
    const list = [];
    images.forEach((img) =>
      list.push({
        type: "image",
        src: img.startsWith("http")
          ? img
          : `http://localhost:3001/${img}`,
      })
    );
    if (video) {
      list.push({
        type: "video",
        src: video.startsWith("http")
          ? video
          : `http://localhost:3001/${video}`
      });
    }
    return list;
  }, [images, video]);

  const [activeMedia, setActiveMedia] = useState(null);
  useEffect(() => {
    if (mediaList.length) setActiveMedia(mediaList[0]);
  }, [mediaList]);

  /* ===============================
   FULLSCREEN
=============================== */
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);


  const toggleFullscreen = () => {
    const el = fullscreenRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };


  /* ===============================
     VIDEO CONTROLS
  =============================== */
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => {
      setProgress((v.currentTime / v.duration) * 100 || 0);
    };

    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [activeMedia]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = (e.target.value / 100) * v.duration;
  };

  /* ===============================
     RATINGS
  =============================== */
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);



  /* ===============================
   REVIEWS
=============================== */
  const [reviews, setReviews] = useState([]);


  useEffect(() => {
    if (!id) return;

    api.get(`/product/${id}/ratings`)
      .then(res => {
        setAvgRating(res.data.avgRating || 0);
        setRatingCount(res.data.count || 0);
        setReviews(res.data.reviews || []);
      })
      .catch(() => {
        setAvgRating(0);
        setRatingCount(0);
        setReviews([]);
      });
  }, [id]);




  /*Buy Now */

  const handleBuyNow = () => {
    localStorage.setItem(
      "singleCheckoutItem",
      JSON.stringify({
        materialId: id,
        supplierId: sellerId,
        name: title,
        supplier: resolvedSeller,
        amountPerTrip: price,
        trips: 1,
        image: pickCartImage(images),

        // ✅ DELIVERY (MISSING BEFORE)
        shippingChargeType: product.shippingChargeType,
        shippingCharge: product.shippingCharge,
        deliveryTimeMin: product.deliveryTimeMin,
        deliveryTimeMax: product.deliveryTimeMax,

        // ✅ INSTALLATION
        installationAvailable: product.installationAvailable,
        installationCharge: Number(product.installationCharge || 0),
      })
    );

    navigate("/checkout");
  };




  /* ===============================
     CART LOGIC (ORIGINAL)
  =============================== */
  const handleAddToCart = () => {
    addToCart({
      materialId: id,
      supplierId: sellerId,
      name: title,
      supplier: resolvedSeller,
      amountPerTrip: price,
      trips: 1,
      image: pickCartImage(images),

      // ✅ DELIVERY (CRITICAL FIX)
      shippingChargeType: product.shippingChargeType,
      shippingCharge: product.shippingCharge,
      deliveryTimeMin: product.deliveryTimeMin,
      deliveryTimeMax: product.deliveryTimeMax,

      // ✅ INSTALLATION
      installationAvailable: product.installationAvailable,
      installationCharge: product.installationCharge,
    });

    alert("Added to cart");
  };




  /* ===============================
     SHARE
  =============================== */
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title,
        text: "Check out this product on Casa",
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Product link copied!");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pd-container">
          <h1 className="pd-title" style={{ padding: 80 }}>
            Loading product…
          </h1>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pd-container">
          <h1 className="pd-title" style={{ padding: 80 }}>
            Product not found
          </h1>
        </div>
      </>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (
    <>
      <Navbar />

      <div className="pd-container">
        {/* LEFT */}
        <div className="pd-left">
          <div className="pd-thumbnails">
            {mediaList.map((item, i) =>
              item.type === "video" ? (
                <div
                  key={i}
                  className={`pd-thumb video-thumb ${activeMedia?.src === item.src ? "active" : ""}`}
                  onClick={() => setActiveMedia(item)}
                >
                  <PiVideoFill />
                </div>
              ) : (
                <img
                  key={i}
                  src={item.src}
                  className={`pd-thumb ${activeMedia?.src === item.src ? "active" : ""}`}
                  onClick={() => setActiveMedia(item)}
                  alt=""
                />
              )
            )}
          </div>

          <div className="pd-image-box" ref={fullscreenRef}>
            {/* FULLSCREEN BUTTON */}
            <button
              className="pd-fullscreen-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              title={isFullscreen ? "Exit full screen" : "View full screen"}
            >
              {isFullscreen ? "✕" : "⛶"}
            </button>

            {activeMedia?.type === "video" ? (
              <div className="pd-video-wrapper" onClick={togglePlay}>
                <video
                  ref={videoRef}
                  src={activeMedia.src}
                  className="pd-video"
                />

                <div
                  className="pd-video-controls"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={togglePlay} className="pd-video-btn">
                    {isPlaying ? "❚❚" : "▶"}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="pd-video-seek"
                  />

                  <button onClick={toggleMute} className="pd-video-btn">
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={activeMedia?.src || sample}
                className="pd-image"
                alt=""
              />
            )}
          </div>
        </div>

        {/* CENTER */}
        <div className="pd-center">
          <h1 className="pd-title">{title}</h1>

          <div className="pd-rating-line">
            <div className="pd-stars">{renderStars(avgRating)}</div>
            <span className="pd-rating-count">
              {avgRating || "No ratings"} {ratingCount > 0 && `(${ratingCount})`}
            </span>
          </div>

          <div className="pd-description collapsed">
            {displayedDescription}
            {isLongDescription && (
              <button
                type="button"
                className="pd-see-more"
                onClick={toggleDescription}
                style={{
                  marginLeft: 8,
                  background: "transparent",
                  border: "none",
                  color: "var(--green-mid)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {descExpanded ? "See less" : "See more"}
              </button>
            )}
          </div>

          <hr className="pd-divider" />

          <div className="pd-key-details">
            <p><strong>Seller:</strong> {resolvedSeller}</p>
            <p><strong>Origin:</strong> {resolvedOrigin}</p>
            <p><strong>Status:</strong> {formatAvailability(availability)}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="pd-right">
          <div className="pd-buybox">
            <p className="pd-buybox-title">{title}</p>
            <p className="pd-price">₹{price.toLocaleString()}</p>

            <button className="pd-btn pd-btn-buy" onClick={handleBuyNow}>
              🛒 Buy Now
            </button>

            <button className="pd-btn pd-btn-cart" onClick={handleAddToCart}>
              ➕ Add to Cart
            </button>

            <button className="pd-btn pd-btn-back" onClick={() => navigate(-1)}>
              ← Go Back
            </button>

            <button className="pd-btn pd-btn-share" onClick={handleShare}>
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      {/* ===============================
              REVIEWS SECTION
          =============================== */}
      <section className="pd-reviews-section">
        <h2 className="pd-reviews-title">
          Customer Reviews {ratingCount > 0 && <span>({ratingCount})</span>}
        </h2>

        {reviews.length === 0 ? (
          <p className="pd-no-reviews">No reviews yet.</p>
        ) : (
          <div className="pd-reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="pd-review-card">
                <div className="pd-review-header">
                  <span className="pd-review-user">{r.user}</span>
                  <div className="pd-stars">{renderStars(r.stars)}</div>
                </div>

                {r.comment && (
                  <p className="pd-review-comment">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer/>

    </>
  );
};

export default ProductInfo;
