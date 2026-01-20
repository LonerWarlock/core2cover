"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link'; // IMPORTED FOR DRAG & DROP
import { useRouter } from "next/navigation";
import { FiHome, FiShoppingCart, FiUser, FiMenu, FiX, FiPackage, FiRotateCcw } from "react-icons/fi";
import { PiBank } from "react-icons/pi";
import { AiOutlineProduct } from "react-icons/ai";
import { IoBusinessOutline } from "react-icons/io5";
import "./Sidebar.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

const Sidebar = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 618);
      if (window.innerWidth > 618) setMenuOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { icon: <FiHome />, label: "Home", path: "/sellerdashboard" },
    { icon: <FiShoppingCart />, label: "Orders", path: "/orders" },
    { icon: <FiUser />, label: "Profile", path: "/sellerprofile" },
    { icon: <FiPackage />, label: "Add Product", path: "/selleraddproduct" },
    { icon: <AiOutlineProduct />, label: "My Products", path: "/sellerproducts" },
    { icon: <FiUser />, label: "Delivery Settings", path: "/sellerdeliveryupdate" },
    { icon: <IoBusinessOutline />, label: "Business Details", path: "/editbusinessdetails" },
    { icon: <PiBank />, label: "Bank Details", path: "/sellerbankdetails" },
    { icon: <FiRotateCcw />, label: "Return Requests", path: "/sellerreturns" },
  ];

  return (
    <div className="sidebar-wrapper">
      {isMobile ? (
        <>
          <div className="nav">
            <button className="nav-hamburger" onClick={() => setMenuOpen(true)}><FiMenu /></button>
            
            {/* LOGO WRAPPER - Updated for Drag & Drop support */}
            <Link href="/" className="nav-logo" draggable="true" style={{ display: 'flex', alignItems: 'center' }}>
              <Image 
                src={CoreToCoverLogo} 
                alt="CoreToCover" 
                width={120} 
                height={40} 
                className="sidebar-logo-img" 
                style={{objectFit: "contain"}} 
              />
            </Link>
            
            <div className="nav-placeholder" />
          </div>

          <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <button className="nav-close" onClick={() => setMenuOpen(false)}><FiX /></button>
            {navItems.map((item) => (
              <button key={item.path} className="nav-menu-item" onClick={() => { router.push(item.path); setMenuOpen(false); }}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </div>
          {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
        </>
      ) : (
        <div className="sidebar-panel">
          
          {/* LOGO WRAPPER - Updated for Drag & Drop support */}
          <Link href="/" className="sidebar-logo" draggable="true" style={{ display: 'block', width: '100%' }}>
            <Image 
              src={CoreToCoverLogo} 
              alt="CoreToCover" 
              width={150} 
              height={50} 
              className="sidebar-logo-img" 
              style={{objectFit: "contain"}} 
            />
          </Link>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button key={item.path} className="sidebar-nav-item" onClick={() => router.push(item.path)}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Sidebar;