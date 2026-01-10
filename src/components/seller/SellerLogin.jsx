"use client";

import React, { useState } from "react";
import "./SellerLogin.css";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation"; // CHANGED
import { sellerLogin } from "../../api/sellerAuth"; // Ensure this file exists or use axios directly
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";
import Image from "next/image";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword] = useState(false);
  const router = useRouter(); // CHANGED

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please enter email and password.");

    try {
      const res = await sellerLogin({ email, password });
      localStorage.setItem("sellerId", res.data.seller.id);
      localStorage.setItem("sellerEmail", res.data.seller.email);
      localStorage.setItem("sellerProfile", JSON.stringify(res.data.seller));
      window.dispatchEvent(new Event("storage"));
      
      router.push("/sellerdashboard"); // CHANGED
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Image src={CoreToCoverLogo.src || CoreToCoverLogo} alt="CoreToCover" className="brand-logo" />
        <h4>Welcome back, Seller</h4>
        <form onSubmit={handleSubmit}>
          {/* Inputs remain same */}
          <div className="input-groups">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-groups">
            <label>Password</label>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <p className="signup-text">
            Don’t have a seller account? <Link href="/sellersignup">Sign up</Link>
          </p>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};
export default SellerLogin;