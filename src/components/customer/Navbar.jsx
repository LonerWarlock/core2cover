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
  FaUserGraduate,
} from "react-icons/fa";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

const Brand = ({ children }) => <span className="brand">{children}</span>;
const BrandBold = ({ children }) => (<span className="brand brand-bold">{children}</span>);
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const currentPageTitle = "Readymade Products";

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]); // Remove searchQuery from the dependency array!

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value); // This allows the user to type freely
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/searchresults?search=${encodeURIComponent(query)}`);
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
            <Link href="/" className="nav-link nav-logo-link">
              <span className="nav-logo-wrap">
                <Image
                  src={CoreToCoverLogo}
                  alt="CoreToCover"
                  className="nav-logo"
                  width={50}
                  height={50}
                  priority
                />
                <span className="brand"><BrandBold>Core2Cover</BrandBold></span>
              </span>
            </Link>
          </div>

          <div className="nav-right">
            {/* Always visible icons on Desktop */}
            <div className="nav-icons-desktop">

              <Link href="/about" className="nav-icon-link">About Us</Link>
              <Link href="/cart" className="nav-icon-link"><FaShoppingCart /></Link>
              <Link href="/userprofile" className="nav-icon-link" onClick={handleProfileClick}><FaUser /></Link>
            </div>

            {/* Hamburger visible on Laptop/Desktop too */}
            <div className="hamburger always-visible" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>

              {/* These are now inside the hamburger for all screen sizes */}
              <li>
                <Link href="/sellersignup" className="seller-btn" onClick={() => setMenuOpen(false)}>
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/designersignup" className="seller-btn" onClick={() => setMenuOpen(false)}>
                  I am a Designer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Searchbar only appears if NOT on Home */}
      {!isHomePage && (
        <div className="search-container visible">
          <form onSubmit={handleSearch} className="search_form active-bar">
            <input
              className="search_input"
              type="text"
              placeholder={`Search ${currentPageTitle}...`}
              value={searchQuery} // Controlled component
              onChange={handleInputChange} // Ensure this function is called
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