"use client";

import React, { useState } from "react";
import "./SellerLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sellerLogin } from "../../api/sellerAuth";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const res = await sellerLogin({ email, password });
      localStorage.setItem("sellerId", res.data.seller.id);
      localStorage.setItem("sellerEmail", res.data.seller.email);
      localStorage.setItem("sellerProfile", JSON.stringify(res.data.seller));
      window.dispatchEvent(new Event("storage"));
      router.push("/sellerdashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Image
          src={CoreToCoverLogo}
          alt="CoreToCover"
          className="brand-logo"
          width={150}
          height={50}
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

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;