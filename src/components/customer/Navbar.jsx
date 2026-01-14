"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import "./Navbar.css";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";

const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // CONTEXT CHECK: Are we in the designer section?
  const isDesignerSection = pathname.includes("/designers") || pathname.includes("/designer_info");
  const isHomePage = pathname === "/";
  const currentPageTitle = isDesignerSection ? "Professional Designers" : "Readymade Products";

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleInputChange = (e) => setSearchQuery(e.target.value);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // ROUTE BASED ON CONTEXT
    if (isDesignerSection) {
      router.push(`/designers?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`/searchresults?search=${encodeURIComponent(query)}`);
    }
    setMenuOpen(false);
  };

  const handleProfileClick = (e) => {
    const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("userEmail");
    if (!isLoggedIn) {
      e.preventDefault();
      router.push("/login");
      setMenuOpen(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <div
              className="nav-logo-link"
              onClick={() => router.push("/")}
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-logo-wrap">
                <Image src={CoreToCoverLogo} alt="Logo" width={50} height={50} priority />
                <BrandBold>Core2Cover</BrandBold>
              </span>
            </div>
          </div>

          <div className="nav-right">
            <div className="nav-icons-desktop">
              <Link href="/about" className="nav-icon-link">About Us</Link>
              <Link href="/designers" className="nav-icon-link">Designers</Link>
              <Link href="/cart" className="nav-icon-link"><FaShoppingCart /></Link>
              <Link href="/userprofile" className="nav-icon-link" onClick={handleProfileClick}><FaUser /></Link>
            </div>

            <div className="hamburger always-visible" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>

              {/* MOBILE NAV LINKS */}
              <li className="drawer-link">
                <Link href="/about" onClick={() => setMenuOpen(false)}>
                  About Us
                </Link>
              </li>

              <li className="drawer-link">
                <Link href="/designers" onClick={() => setMenuOpen(false)}>
                  Designers
                </Link>
              </li>

              {/* CTA GROUP */}
              <li className="drawer-cta">
                <Link
                  href="/sellersignup"
                  className="seller-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Become a Seller
                </Link>

                <Link
                  href="/designersignup"
                  className="seller-btn primary"
                  onClick={() => setMenuOpen(false)}
                >
                  I am a Designer
                </Link>
              </li>

            </ul>

          </div>
        </div>
      </header>

      {!isHomePage && (
        <div className="search-container visible">
          <form onSubmit={handleSearch} className="search_form active-bar">
            <input
              className="search_input"
              type="text"
              placeholder={`Search ${currentPageTitle}...`}
              value={searchQuery}
              onChange={handleInputChange}
            />
            <button type="submit" className="search_button" disabled={!searchQuery.trim()}>
              <FaSearch />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Navbar;