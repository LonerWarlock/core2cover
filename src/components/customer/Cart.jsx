"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Cart.css";
import sample from "../../assets/images/sample.jpg";
import {
  loadCart,
  updateCartItemQuantity,
  removeFromCart,
  clearSingleCheckoutItem,
} from "../../utils/cart";

const Cart = () => {
  const router = useRouter();
  const [basketItems, setBasketItems] = useState(() => {
    if (typeof window !== "undefined") {
      const cart = loadCart();
      return Array.isArray(cart) ? cart : [];
    }
    return [];
  });

  /* ===============================
     LOAD CART
  =============================== */
  const refreshCart = () => {
    // Ensure this runs only on client
    if (typeof window !== "undefined") {
        const cart = loadCart();
        setBasketItems(Array.isArray(cart) ? cart : []);
    }
  };

  useEffect(() => {
    // Effect cleanup or external system synchronization if needed
  }, []);

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
    updateCartItemQuantity(id, qty >= 1 ? qty : 1);
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
     TOTAL
  =============================== */
  const subtotal = basketItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.amountPerTrip) || 0) *
        (Number(item.trips) || 1),
    0
  );

  /* ===============================
     CHECKOUT NAVIGATION 
  =============================== */
  const handleCheckout = () => {
    if (!basketItems.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      localStorage.setItem("casa_cart", JSON.stringify(basketItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }

    clearSingleCheckoutItem();
    router.push("/checkout");
  };

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <h1 className="cart-heading">Your Shopping Cart</h1>

        <section className="cart-layout">
          <div className="cart-list">
            {basketItems.length === 0 ? (
              <p className="cart-empty">Your cart is empty.</p>
            ) : (
              basketItems.map((item) => (
                <article
                  key={item.materialId}
                  className="cart-card"
                >
                  <div className="cart-img-box">
                    <Image
                      src={item.image || sample}
                      className="cart-img"
                      alt={item.name}
                      width={200}
                      height={200}
                      onError={(e) => {
                        e.target.src = sample.src || sample;
                      }}
                    />
                  </div>

                  <div className="cart-details">
                    <h3>{item.name}</h3>
                    <p className="cart-price">
                      ₹
                      {(
                        Number(item.amountPerTrip) *
                        (Number(item.trips) || 1)
                      ).toLocaleString()}
                    </p>

                    <div className="cart-actions">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.trips}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.materialId,
                            e.target.value
                          )
                        }
                        onBlur={(e) =>
                          handleQuantityBlur(
                            item.materialId,
                            e.target.value
                          )
                        }
                      />

                      <button
                        className="cart-remove-btn"
                        onClick={() =>
                          handleRemove(item.materialId)
                        }
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
            <div className="summary-row total">
              <span>Total</span>
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
      <Footer/>
    </>
  );
};

export default Cart;