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

  useEffect(() => {
    // Client-side initialization
    const userEmail = localStorage.getItem("userEmail") || "";
    setEmail(userEmail);

    const single = getSingleCheckoutItem();
    const rawItems = single ? [single] : getCart();

    const normalized = (Array.isArray(rawItems) ? rawItems : []).map((it) => ({
      ...it,
      quantity: Number(it.quantity ?? it.trips ?? 1) || 1,
    }));

    setItems(normalized);

    if (userEmail) {
      api
        .get(`/user/${encodeURIComponent(userEmail)}`)
        .then((res) => {
          setName(res.data.name || "");
          setAddress(res.data.address || "");
        })
        .catch(() => {});
    }

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
      copy[index] = {
        ...copy[index],
        quantity: (Number(copy[index].quantity) || 0) + 1,
      };
      return copy;
    });
  };

  const decrement = (index) => {
    setItems((prev) => {
      const copy = [...prev];
      const current = Number(copy[index].quantity) || 1;
      copy[index] = { ...copy[index], quantity: current > 1 ? current - 1 : 1 };
      return copy;
    });
  };

  const computeSummary = useMemo(() => {
    let subtotal = 0;
    let deliveryCharge = 0;
    let installationTotal = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity || 1);
      const unitPrice = Number(it.amountPerTrip || it.pricePerTrip || it.price || 0);
      subtotal += unitPrice * qty;

      if (it.shippingChargeType !== "free" && Number(it.shippingCharge) > 0) {
        deliveryCharge += Number(it.shippingCharge);
      }

      if (it.installationAvailable === "yes" && Number(it.installationCharge) > 0) {
        installationTotal += Number(it.installationCharge) * qty;
      }
    });

    const casaCharge = Math.round(subtotal * 0.02);
    const grandTotal = subtotal + deliveryCharge + installationTotal + casaCharge;

    return { subtotal, deliveryCharge, installationTotal, casaCharge, grandTotal };
  }, [items]);

  const handlePlaceOrder = async () => {
    if (!email || !name || !address) {
      alert("Please provide name, email and address.");
      return;
    }
    if (!items.length) {
      alert("No items to place order.");
      return;
    }

    const summary = computeSummary;
    const creditUsed = useCreditForFullAmount ? Number(summary.grandTotal) : 0;
    
    if (useCreditForFullAmount && credit < summary.grandTotal) {
      alert("Insufficient store credit.");
      return;
    }

    const ordersPayload = items.map((it) => ({
      supplierId: Number(it.supplierId),
      materialId: Number(it.materialId || it.productId || 0),
      materialName: it.name || it.materialName || it.productName || "",
      supplierName: it.supplier || it.supplierName || "",
      trips: Number(it.quantity || 1),
      amountPerTrip: Number(it.amountPerTrip || it.pricePerTrip || it.price || 0),
      deliveryTimeMin: it.deliveryTimeMin ?? null,
      deliveryTimeMax: it.deliveryTimeMax ?? null,
      shippingChargeType: it.shippingChargeType ?? "free",
      shippingCharge: it.shippingCharge ? Number(it.shippingCharge) : 0,
      installationAvailable: it.installationAvailable ?? "no",
      installationCharge: it.installationCharge ? Number(it.installationCharge) : 0,
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
        alert("Order placed successfully!");
        router.push("/userprofile");
      } else {
        alert("Order placed but unexpected server response.");
      }
    } catch (err) {
      console.error("Place order error:", err);
      alert(err?.response?.data?.message || "Failed to place order.");
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
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="form-row">
                <span>Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="form-row">
                <span>Address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </label>
            </div>

            <div className="checkout-card">
              <h2>Payment</h2>
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
              <h2>Items</h2>
              {items.map((it, idx) => (
                <div key={idx} className="checkout-item">
                  <Image
                    className="checkout-item-img"
                    src={
                      it.image && it.image.startsWith("http")
                        ? it.image
                        : it.image
                        ? `/${it.image}`
                        : "/placeholder.png"
                    }
                    alt={it.name}
                    width={80}
                    height={80}
                    style={{ objectFit: "cover" }}
                  />
                  <div className="checkout-item-main">
                    <div className="checkout-item-top">
                      <div className="checkout-item-title">{it.name}</div>
                      <div className="checkout-item-price">
                        {formatINR(Number(it.amountPerTrip || 0))}
                      </div>
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
                <span>Platform Fee (CASA)</span>
                <span>{formatINR(computeSummary.casaCharge)}</span>
              </div>
              <hr />
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatINR(computeSummary.grandTotal)}</span>
              </div>
              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0}
              >
                {loading ? "Placing order..." : "Place order"}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}