"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import MessageBox from "../ui/MessageBox"; // Assuming you have this component

const formatINR = (n = 0) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function Checkout() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [credit, setCredit] = useState(0);
  const [useCreditForFullAmount, setUseCreditForFullAmount] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  useEffect(() => {
    // 1. Get user identity
    const userEmail = localStorage.getItem("userEmail") || "";
    setEmail(userEmail);

    // 2. Fetch Items and Normalise Data Types
    const single = getSingleCheckoutItem();
    const rawItems = single ? [single] : getCart();

    const normalized = (Array.isArray(rawItems) ? rawItems : []).map((it) => ({
      ...it,
      quantity: Number(it.quantity ?? it.trips ?? 1) || 1,
      amountPerTrip: Number(it.amountPerTrip || it.price || 0),

      // Ensure these match the keys saved in Cart.jsx
      shippingCharge: Number(it.shippingCharge || it.deliveryCharge || 0),
      installationCharge: Number(it.installationCharge || 0),

      // CRITICAL: Preserve these strings for the useMemo logic to work
      shippingChargeType: it.shippingChargeType || "free",
      installationAvailable: it.installationAvailable || "no",
    }));

    setItems(normalized);

    // 3. Fetch User Profile
    if (userEmail) {
      api
        .get(`/user/${encodeURIComponent(userEmail)}`)
        .then((res) => {
          setName(res.data.name || "");
          setAddress(res.data.address || "");
        })
        .catch(() => { });
    }

    // 4. Fetch Credits
    getUserCredit()
      .then((res) => {
        const c = Number(res.data.credit || 0);
        setCredit(Number.isFinite(c) ? c : 0);
      })
      .catch(() => setCredit(0));
  }, []);

  const increment = (index) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: copy[index].quantity + 1 };
      return copy;
    });
  };

  const decrement = (index) => {
    setItems((prev) => {
      const copy = [...prev];
      const current = copy[index].quantity;
      copy[index] = { ...copy[index], quantity: current > 1 ? current - 1 : 1 };
      return copy;
    });
  };

  /* =========================================
      CALCULATION LOGIC (FIXED)
  ========================================= */
  const computeSummary = useMemo(() => {
    let subtotal = 0;
    let deliveryCharge = 0;
    let installationTotal = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity || 1);
      const sCharge = Number(it.shippingCharge || 0);
      const iCharge = Number(it.installationCharge || 0);

      subtotal += Number(it.amountPerTrip || 0) * qty;

      // Check if shipping is NOT free
      const isPaidShipping = String(it.shippingChargeType).toLowerCase() !== "free";
      if (isPaidShipping && sCharge > 0) {
        deliveryCharge += sCharge;
      }

      // Check if installation is requested
      const hasInstallation = String(it.installationAvailable).toLowerCase() === "yes";
      if (hasInstallation && iCharge > 0) {
        installationTotal += (iCharge * qty);
      }
    });
    const casaCharge = Math.round(subtotal * 0.02);
    const grandTotal = subtotal + deliveryCharge + installationTotal + casaCharge;

    return { subtotal, deliveryCharge, installationTotal, casaCharge, grandTotal };
  }, [items]);

  const handlePlaceOrder = async () => {
    if (!email || !name || !address) {
      triggerMsg("Please provide your name, email, and full address.", "error");
      return;
    }
    if (!items.length) {
      triggerMsg("Your cart is empty.", "error");
      return;
    }

    const summary = computeSummary;
    const creditUsed = useCreditForFullAmount ? summary.grandTotal : 0;

    if (useCreditForFullAmount && credit < summary.grandTotal) {
      triggerMsg("Insufficient store credit to complete this purchase.", "error");
      return;
    }

    const ordersPayload = items.map((it) => ({
      supplierId: Number(it.supplierId),
      materialId: Number(it.materialId || it.productId || 0),
      materialName: it.name || it.materialName || "",
      supplierName: it.supplier || it.supplierName || "",
      trips: it.quantity,
      amountPerTrip: it.amountPerTrip,
      deliveryTimeMin: it.deliveryTimeMin ?? null,
      deliveryTimeMax: it.deliveryTimeMax ?? null,
      shippingChargeType: it.shippingChargeType,
      shippingCharge: it.shippingCharge,
      installationAvailable: it.installationAvailable,
      installationCharge: it.installationCharge,
      imageUrl: it.image || null,
    }));

    setLoading(true);
    try {
      const res = await api.post("/order/place", {
        customerEmail: email,
        checkoutDetails: {
          name,
          address,
          paymentMethod: useCreditForFullAmount ? "store_credit" : paymentMethod,
        },
        orders: ordersPayload,
        summary,
        creditUsed,
      });

      if (res?.data?.orderId) {
        clearSingleCheckoutItem();
        clearCart();
        triggerMsg("Order placed successfully!", "success");
        setTimeout(() => router.push("/userprofile"), 2000);
      }
    } catch (err) {
      triggerMsg(err?.response?.data?.message || "Failed to place order.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useCreditForFullAmount) setPaymentMethod("store_credit");
  }, [useCreditForFullAmount]);

  return (
    <>
      <Navbar />
      {msg.show && (
        <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />
      )}

      <main className="checkout-page container">
        <h1 className="checkout-title">Checkout</h1>

        <section className="credit-line">
          <div className="credit-left">
            Store Credit: <strong>{formatINR(credit)}</strong>
          </div>
          <div className="credit-right">
            <label className="credit-toggle">
              <input
                type="checkbox"
                checked={useCreditForFullAmount}
                onChange={(e) => setUseCreditForFullAmount(e.target.checked)}
              />
              <span>Deduct total from store credit</span>
            </label>
          </div>
        </section>

        <div className="checkout-grid">
          <section className="checkout-left">
            <div className="checkout-card">
              <h2>Shipping & Contact</h2>
              <label className="form-row">
                <span>Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
              </label>
              <label className="form-row">
                <span>Email</span>
                <input value={email} disabled className="disabled-input" />
              </label>
              <label className="form-row">
                <span>Shipping Address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Street, City, Pincode"
                />
              </label>
            </div>

            <div className="checkout-card">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <button
                  type="button"
                  disabled={useCreditForFullAmount}
                  className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <Image src={COD} alt="COD" width={40} height={25} />
                  <span>Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  disabled={useCreditForFullAmount}
                  className={`payment-option ${paymentMethod === "gpay" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("gpay")}
                >
                  <Image src={GooglePay} alt="Google Pay" width={40} height={25} />
                  <span>Google Pay</span>
                </button>

                <button
                  type="button"
                  disabled={useCreditForFullAmount}
                  className={`payment-option ${paymentMethod === "paytm" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("paytm")}
                >
                  <Image src={Paytm} alt="Paytm" width={40} height={25} />
                  <span>Paytm</span>
                </button>

                <button
                  type="button"
                  disabled={useCreditForFullAmount}
                  className={`payment-option ${paymentMethod === "phonepe" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("phonepe")}
                >
                  <Image src={PhonePe} alt="PhonePe" width={40} height={25} />
                  <span>PhonePe</span>
                </button>
              </div>
              {useCreditForFullAmount && (
                <p className="payment-note">Payment method locked to Store Credit.</p>
              )}
            </div>

            <div className="checkout-card">
              <h2>Order Items</h2>
              {items.map((it, idx) => (
                <div key={idx} className="checkout-item">
                  <Image
                    className="checkout-item-img"
                    src={it.image ? (it.image.startsWith("http") ? it.image : `/${it.image}`) : "/placeholder.png"}
                    alt={it.name}
                    width={80}
                    height={80}
                    style={{ objectFit: "cover" }}
                  />
                  <div className="checkout-item-main">
                    <div className="checkout-item-top">
                      <div className="checkout-item-title">{it.name}</div>
                      <div className="checkout-item-price">{formatINR(it.amountPerTrip)}</div>
                    </div>

                    <div className="checkout-item-details">
                      {it.shippingCharge > 0 && <small>Delivery: {formatINR(it.shippingCharge)}</small>}
                      {it.installationCharge > 0 && <small> • Installation: {formatINR(it.installationCharge)}</small>}
                    </div>

                    <div className="checkout-quantity">
                      <button type="button" onClick={() => decrement(idx)}>−</button>
                      <input type="number" value={it.quantity} readOnly />
                      <button type="button" onClick={() => increment(idx)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="checkout-right">
            <div className="summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>{formatINR(computeSummary.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charges</span>
                <span>{formatINR(computeSummary.deliveryCharge)}</span>
              </div>
              <div className="summary-row">
                <span>Installation Charges</span>
                <span>{formatINR(computeSummary.installationTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Platform Fee (2%)</span>
                <span>{formatINR(computeSummary.casaCharge)}</span>
              </div>
              <hr />
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>{formatINR(computeSummary.grandTotal)}</span>
              </div>
              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0}
              >
                {loading ? "Processing..." : "Confirm & Place Order"}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}