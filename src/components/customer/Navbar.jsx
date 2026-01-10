"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import "./Navbar.css";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaUserGraduate,
} from "react-icons/fa";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

const Brand = ({ children }) => <span className="brand">{children}</span>;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPageTitle = "Readymade Products"; // Default for Navbar context

  /* =========================
     SYNC SEARCH WITH URL
  ========================= */
  useEffect(() => {
    // Only available on client
    const q = searchParams.get("search") || "";
    queueMicrotask(() => {
      setSearchQuery(q);
    });
  }, [searchParams]);

  /* =========================
     HANDLE SEARCH
  ========================= */
  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    router.push(`/searchresults?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-link nav-logo-link">
              <span className="nav-logo-wrap">
                <Image
                  src={CoreToCoverLogo}
                  alt="CoreToCover"
                  className="nav-logo"
                  width={40}
                  height={40}
                />
                <Brand>Core2Cover</Brand>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Search */}
          <div className="nav-center">
            <form onSubmit={handleSearch} className="search_form">
              <input
                className="search_input"
                type="text"
                placeholder={`Search ${currentPageTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="search_button"
                disabled={!searchQuery.trim()}
              >
                <FaSearch className="search-ico" />
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="nav-right">
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li>
                <Link href="/userprofile" className="nav-link">
                  <FaUser /> Profile
                </Link>
              </li>

              <li>
                <Link href="/myhireddesigners" className="nav-link">
                  <FaUserGraduate /> My Hired Designers
                </Link>
              </li>

              <li>
                <Link href="/cart" className="cart-btn">
                  <FaShoppingCart /> Cart
                </Link>
              </li>

              <li>
                <Link href="/sellersignup" className="seller-btn">
                  Become a Seller
                </Link>
              </li>

              <li>
                <Link href="/designersignup" className="seller-btn">
                  I am a Designer
                </Link>
              </li>
            </ul>

            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search_form mobile">
          <input
            className="search_input"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="search_button"
            disabled={!searchQuery.trim()}
          >
            <FaSearch />
          </button>
        </form>
      </div>
    </>
  );
};

export default Navbar;