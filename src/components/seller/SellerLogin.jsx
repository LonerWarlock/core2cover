"use client";

import React, { useState } from "react";
import "./SellerLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sellerLogin } from "../../api/auth";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* =========================================
      EASY ENCRYPTION HELPERS
  ========================================= */
  
  /**
   * Scrambles data before saving to Local Storage to prevent plain-text visibility.
   */
  const secureSetItem = (key, value) => {
    if (!value) return;
    const encodedValue = btoa(String(value)); // Encodes to Base64
    localStorage.setItem(key, encodedValue);
  };

  /**
   * Decodes the backend payload.
   */
  const decodePayload = (payload) => {
    try {
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error("Payload decoding failed:", e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await sellerLogin({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      const data = response?.data ?? response;

      // Handle the encrypted payload from the backend
      if (data?.payload) {
        const decodedSeller = decodePayload(data.payload);

        // Clear any existing plain-text identifiers
        localStorage.removeItem("sellerId");
        localStorage.removeItem("sellerEmail");
        localStorage.removeItem("sellerProfile");

        // Save new data in scrambled format for privacy in "Inspect" tool
        secureSetItem("sellerId", decodedSeller.id);
        secureSetItem("sellerEmail", decodedSeller.email);
        secureSetItem("sellerProfile", JSON.stringify(decodedSeller));

        // Trigger storage event for Navbar/Sidebar synchronization
        window.dispatchEvent(new Event("storage"));
        router.push("/sellerdashboard");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner message="Accessing your store dashboard..." />}

      <div className="login-container">
        <div className="login-card">
          <Image
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="brand-logo"
            width={150}
            height={50}
            priority
            style={{ width: 'auto', height: 'auto', maxWidth: '200px' }}
          />
          <h4>Welcome back, Seller</h4>
          <p className="subtitle">Log in to manage your store</p>

          <form onSubmit={handleSubmit}>
            <div className="input-groups">
              <label>Email</label>
              <input
                type="email"
                placeholder="seller@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-groups">
              <label>Password</label>
              <div className="password-fld">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle_btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <p className="signup-text">
              Don’t have a seller account?{" "}
              <Link href="/sellersignup">Sign up</Link>
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SellerLogin;