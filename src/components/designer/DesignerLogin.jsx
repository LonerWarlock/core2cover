"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./DesignerLogin.css";
import { designerLogin } from "../../api/designer";

const DesignerLogin = () => {
  const Brand = ({ children }) => <span className="brand">{children}</span>;
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await designerLogin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      localStorage.setItem("designerId", data.designer.id);
      router.push("/designerdashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-login-page">
      <div className="login-box login-reveal">
        <h1 className="login-logo"><Brand>Core2Cover</Brand></h1>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
           <div className="login-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
           </div>
           <div className="login-field"><label>Password</label><input type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required /></div>
           <button className="login-btn" disabled={loading}>{loading ? "..." : "Login"}</button>
        </form>
        <p className="login-footer">New? <Link href="/designersignup">Sign up</Link></p>
      </div>
    </div>
  );
};
export default DesignerLogin;