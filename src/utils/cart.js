// src/utils/cart.js

// Keys for LocalStorage
const CART_KEY = "casa_cart";
const CHECKOUT_KEY = "singleCheckoutItem";

/* =========================================
    EASY ENCRYPTION HELPERS
   ========================================= */

/**
 * Scrambles data into Base64 format before storage
 */
const encrypt = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString); // Standard Base64 Encoding
  } catch (e) {
    return "";
  }
};

/**
 * Unscrambles Base64 data back into a usable object
 */
const decrypt = (scrambledData) => {
  try {
    if (!scrambledData) return null;
    const jsonString = atob(scrambledData); // Standard Base64 Decoding
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
};

/* =========================================
    CART CORE LOGIC (ENCRYPTED)
   ========================================= */

/**
 * Get all items from the cart
 */
export const getCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const scrambledCart = localStorage.getItem(CART_KEY);
    // Unscramble the data so the UI can read it
    const cart = decrypt(scrambledCart);
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
};

// Alias for getCart
export const loadCart = getCart;

/**
 * Add an item to the cart
 */
export const addToCart = (item) => {
  if (typeof window === "undefined") return;

  const cart = getCart();
  const existingIndex = cart.findIndex((i) => i.materialId === item.materialId);

  if (existingIndex > -1) {
    cart[existingIndex].trips = (Number(cart[existingIndex].trips) || 1) + 1;
  } else {
    cart.push({
      ...item,
      trips: Number(item.trips) || 1,
    });
  }

  // Scramble the cart before saving it to LocalStorage
  localStorage.setItem(CART_KEY, encrypt(cart));
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

  localStorage.setItem(CART_KEY, encrypt(updatedCart));
  window.dispatchEvent(new Event("storage"));
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = (id) => {
  if (typeof window === "undefined") return;

  const cart = getCart();
  const updatedCart = cart.filter((item) => item.materialId !== id);

  localStorage.setItem(CART_KEY, encrypt(updatedCart));
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
    SINGLE ITEM CHECKOUT (ENCRYPTED)
   ========================================= */

export const getSingleCheckoutItem = () => {
  if (typeof window === "undefined") return null;
  try {
    const scrambledItem = localStorage.getItem(CHECKOUT_KEY);
    return decrypt(scrambledItem);
  } catch (error) {
    return null;
  }
};

/**
 * Note: You should also update your ProductInfo.jsx handleBuyNow 
 * to use an 'encrypt()' call if it sets this manually, 
 * or add a 'setSingleCheckoutItem' helper here.
 */
export const setSingleCheckoutItem = (item) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHECKOUT_KEY, encrypt(item));
};

export const clearSingleCheckoutItem = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHECKOUT_KEY);
};