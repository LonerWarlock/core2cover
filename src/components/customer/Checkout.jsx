import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  getCart,
  clearCart,
  getSingleCheckoutItem,
  clearSingleCheckoutItem,
} from "../../utils/cart";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import Navbar from "./Navbar";
import COD from "../../assets/images/COD.png";
import GooglePay from "../../assets/images/GooglePay.png";
import Paytm from "../../assets/images/Paytm.png";
import PhonePe from "../../assets/images/PhonePe.jpg";
import { getUserCredit } from "../../api/return";

/**
 * Checkout component
 * - Supports paying full order with store credit
 * - Sends `creditUsed` to backend via /order/place
 * - Expects backend to atomically deduct credit and may return `newCredit`
 *
 * Notes:
 * - This component deliberately only supports "deduct full total with credit"
 *   (per your request). If you later want partial-credit, we can add a slider/input.
 */

const formatINR = (n = 0) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  // store credit state
  const [credit, setCredit] = useState(0);
  const [useCreditForFullAmount, setUseCreditForFullAmount] = useState(
    false
  );

  // on mount: load cart, user info & credit
  useEffect(() => {
    const single = getSingleCheckoutItem();
    const rawItems = single ? [single] : getCart();

    const normalized = (Array.isArray(rawItems) ? rawItems : []).map(
      (it) => ({
        ...it,
        quantity:
          Number(it.quantity ?? it.trips ?? (it.trips === 0 ? it.trips : 1)) ||
          Number(it.trips || it.quantity) ||
          1,
      })
    );

    setItems(normalized);

    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      api
        .get(`/user/${encodeURIComponent(userEmail)}`)
        .then((res) => {
          setName(res.data.name || "");
          setAddress(res.data.address || "");
        })
        .catch(() => {
          // ignore, user can fill manual
        });
    }

    // fetch credit
    getUserCredit()
      .then((res) => {
        const c = Number(res.data.credit || 0);
        setCredit(Number.isFinite(c) ? c : 0);
      })
      .catch(() => setCredit(0));
  }, []);

  // Quantity helpers
  const updateQuantity = (index, newQty) => {
    let q = Number(newQty);
    if (Number.isNaN(q) || q < 1) q = 1;

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: Math.floor(q) };
      return copy;
    });
  };

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

  // summary calculation
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

    const casaCharge = Math.round(subtotal * 0.02); // 2%
    const grandTotal = subtotal + deliveryCharge + installationTotal + casaCharge;

    return { subtotal, deliveryCharge, installationTotal, casaCharge, grandTotal };
  }, [items]);

  // handle place order
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

    // If using credit for full amount, verify credit suffices
    const creditUsed = useCreditForFullAmount ? Number(summary.grandTotal) : 0;
    if (useCreditForFullAmount && credit < summary.grandTotal) {
      alert("Insufficient store credit to cover the total. Uncheck or top up your credit.");
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

      // success path
      if (res?.data?.orderId) {
        // Prefer authoritative server value
        if (res.data.newCredit !== undefined && res.data.newCredit !== null) {
          setCredit(Number(res.data.newCredit));
        } else if (creditUsed) {
          // fallback: re-fetch credit from server (safe)
          getUserCredit()
            .then((r) => setCredit(Number(r.data.credit || 0)))
            .catch(() => setCredit((c) => c - creditUsed)); // last resort: optimistic
        }

        clearSingleCheckoutItem();
        clearCart();
        alert("Order placed successfully!");
        navigate("/userprofile");
      } else {
        alert("Order placed but unexpected server response.");
      }
    } catch (err) {
      console.error("Place order error:", err);
      alert(err?.response?.data?.message || "Failed to place order — please try again.");
    } finally {
      setLoading(false);
    }
  };

  // disable other payment controls when store credit will be used
  useEffect(() => {
    if (useCreditForFullAmount) setPaymentMethod("store_credit");
  }, [useCreditForFullAmount]);

  return (
    <>
      <Navbar />
      <main className="checkout-page container">
        <h1 className="checkout-title">Checkout</h1>

        <section className="credit-line" aria-live="polite">
          <div className="credit-left">Store Credit: <strong>{formatINR(credit)}</strong></div>
          <div className="credit-right">
            <label className="credit-toggle">
              <input
                type="checkbox"
                checked={useCreditForFullAmount}
                onChange={(e) => {
                  const want = e.target.checked;
                  if (want && credit < computeSummary.grandTotal) {
                    alert("You don't have enough store credit to cover the total.");
                    return;
                  }
                  setUseCreditForFullAmount(want);
                }}
                aria-label="Use store credit to pay full amount"
              />
              <span>Deduct total from store credit</span>
            </label>
          </div>
        </section>

        <div className="checkout-grid">
          <section className="checkout-left" aria-labelledby="checkout-shipping">
            <div className="checkout-card">
              <h2 id="checkout-shipping">Shipping & Contact</h2>

              <label className="form-row">
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  inputMode="text"
                  autoComplete="name"
                />
              </label>

              <label className="form-row">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  inputMode="email"
                  autoComplete="email"
                />
              </label>

              <label className="form-row">
                <span>Address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                  autoComplete="street-address"
                />
              </label>
            </div>

            <div className="checkout-card">
              <h2>Payment</h2>

              {/* treat payment options like a radio group for accessibility */}
              <div
                className={`payment-options ${useCreditForFullAmount ? "muted" : ""}`}
                role="radiogroup"
                aria-disabled={useCreditForFullAmount}
                aria-hidden={useCreditForFullAmount}
              >
                {[
                  { id: "gpay", label: "Google Pay", img: GooglePay },
                  { id: "phonepe", label: "PhonePe", img: PhonePe },
                  { id: "paytm", label: "Paytm", img: Paytm },
                  { id: "cod", label: "Cash on Delivery", img: COD },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === opt.id}
                    aria-pressed={paymentMethod === opt.id}
                    className={`payment-option ${paymentMethod === opt.id ? "active" : ""}`}
                    onClick={() => setPaymentMethod(opt.id)}
                  >
                    <img src={opt.img} alt={opt.label} loading="lazy" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="checkout-card">
              <h2>Items</h2>

              {items.length === 0 ? (
                <p className="muted">No items to checkout.</p>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} className="checkout-item">
                    <img
                      className="checkout-item-img"
                      src={
                        it.image
                          ? it.image.startsWith("http")
                            ? it.image
                            : `http://localhost:3001/${it.image}`
                          : "/assets/images/sample.jpg"
                      }
                      alt={it.name || "item"}
                      loading="lazy"
                      width="240"
                      height="180"
                    />

                    <div className="checkout-item-main">
                      <div className="checkout-item-top">
                        <div className="checkout-item-title">{it.name}</div>
                        <div className="checkout-item-price">
                          {formatINR(Number(it.amountPerTrip || it.pricePerTrip || it.price || 0))}
                        </div>
                      </div>

                      <div className="checkout-item-meta">
                        <div>Seller: {it.supplier || it.supplierName || "—"}</div>
                        <div>
                          Shipping: {it.shippingChargeType === "free" ? "Free" : `₹${it.shippingCharge ?? 0}`}
                        </div>
                        <div>
                          Installation:{" "}
                          {it.installationAvailable === "yes"
                            ? it.installationCharge > 0
                              ? `₹${it.installationCharge}`
                              : "Free"
                            : "No"}
                        </div>
                      </div>

                      <div className="checkout-quantity">
                        <button
                          type="button"
                          onClick={() => decrement(idx)}
                          aria-label={`Decrease quantity for ${it.name || "item"}`}
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            updateQuantity(idx, val);
                          }}
                          aria-label={`Quantity for ${it.name || "item"}`}
                        />

                        <button
                          type="button"
                          onClick={() => increment(idx)}
                          aria-label={`Increase quantity for ${it.name || "item"}`}
                        >
                          +
                        </button>

                        <div className="checkout-item-subtotal">
                          Subtotal:{" "}
                          {formatINR(
                            Number(it.amountPerTrip || it.pricePerTrip || it.price || 0) *
                            Number(it.quantity || 1)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>


          <aside className="checkout-right" aria-label="Order summary">
            <div className="summary-card">
              <h2>Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatINR(computeSummary.subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span>{formatINR(computeSummary.deliveryCharge)}</span>
              </div>

              <div className="summary-row">
                <span>Installation</span>
                <span>{formatINR(computeSummary.installationTotal)}</span>
              </div>

              <div className="summary-row">
                <span>Casa charges</span>
                <span>{formatINR(computeSummary.casaCharge)}</span>
              </div>

              <hr />

              <div className="summary-row total">
                <span>Total</span>
                <span>{formatINR(computeSummary.grandTotal)}</span>
              </div>

              {useCreditForFullAmount && (
                <>
                  <div className="summary-row credit-applied">
                    <span>Paid with store credit</span>
                    <span className="credit-amount">{formatINR(computeSummary.grandTotal)}</span>
                  </div>

                  <div className="summary-row amount-to-pay">
                    <span>Amount to pay</span>
                    <span>{formatINR(0)}</span>
                  </div>
                </>
              )}

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0}
                aria-disabled={loading || items.length === 0}
              >
                {loading ? "Placing order..." : (useCreditForFullAmount ? "Pay with Store Credit" : "Place order")}
              </button>

              <p className="checkout-footnote muted">You can use store credit to buy more items in the future. Store credit is not refundable as cash.</p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
