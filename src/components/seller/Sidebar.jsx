"use client"; // Required for client-side interactivity
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiPackage,
} from "react-icons/fi";
import { PiBank } from "react-icons/pi";
import { AiOutlineProduct } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { FiRotateCcw } from "react-icons/fi";
import { IoBusinessOutline } from "react-icons/io5";
import "./Sidebar.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

const Sidebar = ({ notificationCount = 0 }) => {
  const navigate = useNavigate();
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
          {/* Mobile nav */}
          <div className="nav">
            <button className="nav-hamburger" onClick={() => setMenuOpen(true)}>
              <FiMenu />
            </button>
            <div className="nav-logo">
              <Image
                src={CoreToCoverLogo}
                alt="CoreToCover"
                className="sidebar-logo-img"
              />
            </div>

            <div className="nav-placeholder" />
          </div>

          {/* Slide-out Menu */}
          <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <button className="nav-close" onClick={() => setMenuOpen(false)}>
              <FiX />
            </button>
            {navItems.map((item) => (
              <button
                key={item.path}
                className="nav-menu-item"
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Overlay */}
          {menuOpen && (
            <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
          )}
        </>
      ) : (
        // Desktop Sidebar
        <div className="sidebar-panel">
          <div className="sidebar-logo">
            <Image
              src={CoreToCoverLogo}
              alt="CoreToCover"
              className="sidebar-logo-img"
            />
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.path}
                className="sidebar-nav-item"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
