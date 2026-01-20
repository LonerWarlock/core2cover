"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import api from "../../api/axios";
import {
  getCart,
  clearCart,
  getSingleCheckoutItem,
  clearSingleCheckoutItem,
} from "../../utils/cart";
import { useRouter } from "next/navigation";
import "./Checkout.css";
import Navbar from "./Navbar";
import COD from "../../assets/images/COD.png";
import GooglePay from "../../assets/images/GooglePay.png";
import Paytm from "../../assets/images/Paytm.png";
import PhonePe from "../../assets/images/PhonePe.jpg";
import { getUserCredit } from "../../api/return";
import Image from "next/image";
import MessageBox from "../ui/MessageBox";
import sample from "../../assets/images/sample.jpg";
import { FaArrowLeft, FaMapMarkerAlt, FaSearch, FaShoppingBag, FaTruckLoading, FaRulerCombined, FaTools } from "react-icons/fa";

// Google Maps Imports
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";

const LIBRARIES = ["places", "maps"];

const mapContainerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "12px",
  marginTop: "15px",
  border: "1px solid rgba(0,0,0,0.1)"
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const formatINR = (n = 0) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function Checkout() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [credit, setCredit] = useState(0);
  const [useCreditForFullAmount, setUseCreditForFullAmount] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const triggerMsg = (text, type = "success") => setMsg({ text, type, show: true });

  /* ======================================================
      TRIP-SENSITIVE QUANTITY UPDATE
  ====================================================== */
  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.materialId === id) {
          const capacity = Number(it.unitsPerTrip || 1);
          const newTrips = Math.ceil(newQty / capacity);
          return { ...it, quantity: newQty, trips: newTrips };
        }
        return it;
      })
    );
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      const location = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      setMarkerPosition(location);
      setAddress(place.formatted_address || "");
      if (mapRef.current) {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(17);
      }
    }
  };

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const location = { lat, lng };
    setMarkerPosition(location);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results[0]) setAddress(results[0].formatted_address);
    });
  }, []);

  useEffect(() => {
    const effectiveEmail = session?.user?.email || localStorage.getItem("userEmail");
    if (effectiveEmail) {
      setEmail(effectiveEmail);
      api.get(`/user/${encodeURIComponent(effectiveEmail)}`)
        .then((res) => {
          setName(res.data.name || session?.user?.name || "");
          setAddress(res.data.address || "");
        }).catch(() => { });
    }

    const single = getSingleCheckoutItem();
    const rawItems = single ? [single] : getCart();

    setItems((Array.isArray(rawItems) ? rawItems : []).map((it) => {
      const qty = Number(it.quantity || 1);
      const upt = Number(it.unitsPerTrip || 1);

      return {
        ...it,
        quantity: qty,
        unit: it.unit || "pcs",
        conversionFactor: Number(it.conversionFactor || 1),
        unitsPerTrip: upt,
        trips: Math.ceil(qty / upt),
        amountPerTrip: Number(it.amountPerTrip || it.price || 0),
        shippingCharge: Number(it.shippingCharge ?? 0),
        installationCharge: Number(it.installationCharge ?? 0),
        shippingChargeType: String(it.shippingChargeType || "Paid").trim(),
        installationAvailable: String(it.installationAvailable || "no").trim(),
      };
    }));

    getUserCredit().then((res) => setCredit(Number(res.data.credit || 0))).catch(() => setCredit(0));
  }, [session, status]);

  /* ======================================================
      SUMMARY CALCULATION (TRIP & INSTALLATION LOGIC)
  ====================================================== */
  const computeSummary = useMemo(() => {
    let subtotal = 0, deliveryCharge = 0, installationTotal = 0;

    items.forEach((it) => {
      subtotal += (Number(it.amountPerTrip) * it.quantity);

      // Delivery Logic: Skip if explicitly Free
      const isFreeShipping = it.shippingChargeType?.toLowerCase() === "free";
      if (!isFreeShipping) {
        deliveryCharge += (Number(it.shippingCharge) * it.trips);
      }

      // STRICT Installation Charge Logic
      if (it.installationAvailable?.toLowerCase() === "yes") {
        installationTotal += (Number(it.installationCharge) * it.quantity);
      }
    });

    let casaCharge = 0;
    if (subtotal < 10000) casaCharge = 89;
    else if (subtotal < 50000) casaCharge = 159;
    else casaCharge = 219;

    return {
      subtotal,
      deliveryCharge,
      installationTotal,
      casaCharge,
      grandTotal: subtotal + deliveryCharge + installationTotal + casaCharge
    };
  }, [items]);

  const handlePlaceOrder = async () => {
    if (!email || !name || !address) return triggerMsg("Please provide all required details.", "error");
    setLoading(true);
    try {
      const res = await api.post("/order/place", {
        customerEmail: email,
        checkoutDetails: { name, address, paymentMethod: useCreditForFullAmount ? "store_credit" : paymentMethod },
        orders: items.map(it => ({
          ...it,
          trips: it.trips,
          unit: it.unit,
          conversionFactor: it.conversionFactor,
          unitsPerTrip: it.unitsPerTrip
        })),
        summary: computeSummary,
        creditUsed: useCreditForFullAmount ? computeSummary.grandTotal : 0,
      });
      if (res?.data?.orderId) {
        localStorage.setItem("userEmail", email.toLowerCase().trim());
        clearSingleCheckoutItem();
        clearCart();
        triggerMsg("Order placed successfully!", "success");
        setTimeout(() => router.push("/userprofile"), 2000);
      }
    } catch (err) {
      triggerMsg(err.response?.data?.message || "Checkout failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div className="error">Map error: {loadError.message}</div>;
  if (!isLoaded) return <div className="loading-maps">Initialising Maps...</div>;

  return (
    <>
      <Navbar />
      {msg.show && <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />}

      <div className="checkout-nav-bar">
        <button className="back-btn" onClick={() => router.back()}><FaArrowLeft /> Back</button>
      </div>

      <main className="checkout-page container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          <section className="checkout-left">
            <div className="checkout-card">
              <h2><FaShoppingBag /> Review Items</h2>
              <div className="checkout-items-list">
                {items.map((item, idx) => (
                  <div key={idx} className="checkout-item">
                    <div className="checkout-item-img-container">
                      <Image
                        src={item.image ? (item.image.startsWith('http') ? item.image : `/${item.image}`) : sample}
                        alt={item.name || "Product Image"} // Added required alt property
                        width={80}
                        height={80}
                        className="checkout-item-img"
                        unoptimized
                      />
                    </div>
                    <div className="checkout-item-details">
                      <h4 className="checkout-item-name">{item.name}</h4>
                      <p className="checkout-item-seller">Seller: {item.supplier || item.seller}</p>

                      <div className="checkout-logistics-info">
                        <span><FaRulerCombined /> {(item.quantity * item.conversionFactor).toFixed(0)} Sq. Ft</span>
                        <span><FaTruckLoading /> {item.trips} Trip(s)</span>
                        {item.installationAvailable === "yes" && (
                          <span className="installation-tag"><FaTools /> Installation Incl.</span>
                        )}
                      </div>

                      <div className="checkout-item-meta-row">
                        <div className="checkout-qty-controls">
                          <button onClick={() => updateQty(item.materialId, item.quantity - 1)}>-</button>
                          <input type="number" value={item.quantity} readOnly />
                          <button onClick={() => updateQty(item.materialId, item.quantity + 1)}>+</button>
                          <span className="checkout-unit-tag">{item.unit}</span>
                        </div>
                        <span className="checkout-item-sub">{formatINR(item.amountPerTrip * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-card">
              <h2>Contact Information</h2>
              <div className="form-grid">
                <label className="form-row">
                  <span>Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                </label>
                <label className="form-row">
                  <span>Email Address</span>
                  <input value={email} disabled className="disabled-input" />
                </label>
              </div>
            </div>

            <div className="checkout-card">
              <h2><FaMapMarkerAlt /> Delivery Location</h2>
              <div className="search-box-wrapper">
                <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
                  <div className="checkout-search-inner">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search for your street or house number..." />
                  </div>
                </Autocomplete>
              </div>
              <GoogleMap mapContainerStyle={mapContainerStyle} center={markerPosition || defaultCenter} zoom={12} onLoad={(map) => (mapRef.current = map)} onClick={onMapClick}>
                {markerPosition && <Marker position={markerPosition} />}
              </GoogleMap>
              <label className="form-row address-textarea" style={{ marginTop: "15px" }}>
                <span>Final Delivery Address</span>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Pin your location on the map..." />
              </label>
            </div>

            <div className="checkout-card">
              <h2>Payment Method</h2>
              <div className="payment-options">
                {['cod', 'gpay', 'paytm', 'phonepe'].map(method => (
                  <button key={method} type="button" className={`payment-option ${paymentMethod === method ? "active" : ""}`} onClick={() => setPaymentMethod(method)}>
                    <Image src={method === 'cod' ? COD : method === 'gpay' ? GooglePay : method === 'paytm' ? Paytm : PhonePe} alt={method} width={40} height={25} />
                    <span>{method === 'cod' ? "Cash on Delivery" : method.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="checkout-right">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Items Subtotal</span>
                  <span>{formatINR(computeSummary.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery ({items.reduce((acc, i) => acc + i.trips, 0)} trips)</span>
                  <span>{formatINR(computeSummary.deliveryCharge)}</span>
                </div>
                {computeSummary.installationTotal > 0 && (
                  <div className="summary-row highlight-row">
                    <span><FaTools /> Installation Charges</span>
                    <span>{formatINR(computeSummary.installationTotal)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Platform Charges</span>
                  <span>{formatINR(computeSummary.casaCharge)}</span>
                </div>
              </div>
              <hr className="summary-divider" />
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>{formatINR(computeSummary.grandTotal)}</span>
              </div>

              <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading || items.length === 0}>
                {loading ? "Processing Order..." : "Confirm & Place Order"}
              </button>
              <p className="checkout-note">Secure encryption applied to all transactions.</p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}