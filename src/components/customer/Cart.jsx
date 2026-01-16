"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Cart.css";
import sample from "../../assets/images/sample.jpg";
import { FaArrowLeft } from "react-icons/fa"; // Imported for the back icon
import {
  loadCart,
  updateCartItemQuantity,
  removeFromCart,
  clearSingleCheckoutItem,
} from "../../utils/cart";

const Cart = () => {
  const router = useRouter();

  // Hydration safety state
  const [isMounted, setIsMounted] = useState(false);
  const [basketItems, setBasketItems] = useState([]);

  /* ===============================
      INITIAL LOAD (Hydration Safe)
  =============================== */
  useEffect(() => {
    setIsMounted(true);
    const cart = loadCart();
    setBasketItems(Array.isArray(cart) ? cart : []);
  }, []);

  /* ===============================
      REFRESH CART
  =============================== */
  const refreshCart = () => {
    const cart = loadCart();
    setBasketItems(Array.isArray(cart) ? cart : []);
  };

  /* ===============================
      QUANTITY HANDLERS
  =============================== */
  const handleQuantityChange = (id, value) => {
    if (value === "") {
      setBasketItems((prev) =>
        prev.map((item) =>
          item.materialId === id ? { ...item, trips: "" } : item
        )
      );
      return;
    }

    const qty = Number(value);
    if (isNaN(qty) || qty < 1) return;

    updateCartItemQuantity(id, qty);
    refreshCart();
  };

  const handleQuantityBlur = (id, value) => {
    const qty = Number(value);
    const finalQty = qty >= 1 ? qty : 1;
    updateCartItemQuantity(id, finalQty);
    refreshCart();
  };

  /* ===============================
      REMOVE ITEM
  =============================== */
  const handleRemove = (id) => {
    removeFromCart(id);
    refreshCart();
  };

  /* ===============================
      TOTAL CALCULATION
  =============================== */
  const subtotal = basketItems.reduce(
    (sum, item) =>
      sum + (Number(item.amountPerTrip) || 0) * (Number(item.trips) || 1),
    0
  );

  /* ===============================
      CHECKOUT NAVIGATION 
  =============================== */
  const handleCheckout = () => {
    if (!basketItems.length) return;

    // Format items to match the Checkout Summary's expected keys
    const formattedItems = basketItems.map(item => ({
      ...item,
      // Ensure these keys match exactly what your Checkout component reads
      deliveryCharge: Number(item.shippingCharge || 0),
      installationCharge: Number(item.installationCharge || 0),
      amountPerTrip: Number(item.amountPerTrip || 0)
    }));

    try {
      localStorage.setItem("casa_cart", JSON.stringify(formattedItems));
      clearSingleCheckoutItem();
      router.push("/checkout");
    } catch (err) {
      console.error("Failed to save cart", err);
    }
  };
  // Prevent rendering the dynamic basket content until mounted on the client
  if (!isMounted) {
    return (
      <>
        <Navbar />
        <main className="cart-page">
          <div className="cart-loading">
            <p>Loading your shopping basket...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="cart-page">
        {/* TOP NAVIGATION / BACK BUTTON */}
        <div className="cart-top-nav">
          <button className="cart-back-btn" onClick={() => router.back()}>
            <FaArrowLeft /> Back to Shopping
          </button>
        </div>

        <h1 className="cart-heading">Your Shopping Basket</h1>

        <section className="cart-layout">
          <div className="cart-list">
            {basketItems.length === 0 ? (
              <div className="cart-empty-container">
                <p className="cart-empty">Your basket is empty.</p>
                <button
                  className="continue-shopping-btn"
                  onClick={() => router.push('/productlisting')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              basketItems.map((item) => (
                <article key={item.materialId} className="cart-card">
                  <div className="cart-img-box">
                    <Image
                      src={
                        item.image && item.image.startsWith("http")
                          ? item.image
                          : item.image
                            ? `/${item.image}`
                            : sample
                      }
                      className="cart-img"
                      alt={item.name || "Product Image"}
                      width={200}
                      height={200}
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className="cart-details">
                    <h3>{item.name}</h3>
                    <p className="cart-price">
                      ₹
                      {(
                        Number(item.amountPerTrip) * (Number(item.trips) || 1)
                      ).toLocaleString()}
                    </p>

                    <div className="cart-actions">
                      <div className="qty-input-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.trips}
                          onChange={(e) =>
                            handleQuantityChange(item.materialId, e.target.value)
                          }
                          onBlur={(e) =>
                            handleQuantityBlur(item.materialId, e.target.value)
                          }
                        />
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => handleRemove(item.materialId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Estimated Total</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>

            <button
              className="checkout-btn"
              disabled={!basketItems.length}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Cart;