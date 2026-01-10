// src/utils/cart.js

// Keys for LocalStorage
const CART_KEY = "casa_cart";
const CHECKOUT_KEY = "singleCheckoutItem";

/**
 * Get all items from the cart
 */
export const getCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
};

// Alias for getCart as used in some components
export const loadCart = getCart;

/**
 * Add an item to the cart
 * Merges quantity if item already exists (based on materialId)
 */
export const addToCart = (item) => {
  if (typeof window === "undefined") return;

  const cart = getCart();
  const existingIndex = cart.findIndex((i) => i.materialId === item.materialId);

  if (existingIndex > -1) {
    // Increment existing item
    cart[existingIndex].trips = (Number(cart[existingIndex].trips) || 1) + 1;
  } else {
    // Add new item
    cart.push({
      ...item,
      trips: Number(item.trips) || 1, // Ensure quantity is set
    });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Dispatch event so other components can react if needed
  window.dispatchEvent(new Event("storage"));
};

/**
 * Update the quantity (trips) of a specific item
 */
export const updateCartItemQuantity = (id, quantity) => {
  if (typeof window === "undefined") return;

  const cart = getCart();
  const updatedCart = cart.map((item) => {
    if (item.materialId === id) {
      return { ...item, trips: quantity };
    }
    return item;
  });

  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("storage"));
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = (id) => {
  if (typeof window === "undefined") return;

  const cart = getCart();
  const updatedCart = cart.filter((item) => item.materialId !== id);

  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("storage"));
};

/**
 * Clear the entire cart
 */
export const clearCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("storage"));
};

/* =========================================
   SINGLE ITEM CHECKOUT (Buy Now) Helpers
   ========================================= */

export const getSingleCheckoutItem = () => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(CHECKOUT_KEY);
    return item ? JSON.parse(item) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
};

export const clearSingleCheckoutItem = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHECKOUT_KEY);
};