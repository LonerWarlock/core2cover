"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaStore,
  FaPalette,
  FaUserCircle
} from "react-icons/fa";

// Import your CSS file
import "./Navbar.css";

// Provided BrandBold Helper
const BrandBold = ({ children }) => (
  <span className="brand brand-bold">{children}</span>
);

// Import your Logo Asset (ensure path is correct)
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isDesignerSection = pathname.includes("/designers") || pathname.includes("/designer_info");
  const isHomePage = pathname === "/";
  const isContactPage = pathname === "/contact";
  const currentPageTitle = isDesignerSection ? "Professional Designers" : "Readymade Products";

  // Sync search query with URL params
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    
    const targetPath = isDesignerSection ? "/designers" : "/searchresults";
    router.push(`${targetPath}?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  const handleProfileToggle = () => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redirect to login if not authenticated
    } else {
      setProfileOpen(!profileOpen);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          {/* LOGO / BRAND SECTION */}
          <div className="nav-left">
            <div className="nav-logo-link" onClick={() => router.push("/")}>
              <span className="nav-logo-wrap">
                <Image 
                  src={CoreToCoverLogo} 
                  alt="Logo" 
                  width={50} 
                  height={50} 
                  priority 
                />
                <BrandBold>Core2Cover</BrandBold>
              </span>
            </div>
          </div>

          <div className="nav-right">
            {/* DESKTOP NAV ICONS */}
            <div className="nav-icons-desktop">
              <Link href="/about" className="nav-icon-link">About Us</Link>
              <Link href="/designers" className="nav-icon-link">Designers</Link>
              <Link href="/cart" className="nav-icon-link">
                <FaShoppingCart />
              </Link>
              
              {/* PROFILE DROPDOWN CONTAINER */}
              <div className="profile-dropdown-container" ref={dropdownRef}>
                <div className="nav-profile-trigger" onClick={handleProfileToggle}>
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="User" 
                      className="nav-user-avatar" 
                    />
                  ) : (
                    <div className="nav-initials-text">
                      {status === "authenticated" 
                        ? getInitials(session.user.name) 
                        : "Om"}
                    </div>
                  )}
                </div>

                {/* THE POP-OUT BOX */}
                {profileOpen && status === "authenticated" && (
                  <div className="profile-popover shadow-reveal">
                    <div className="popover-header">
                      <p className="pop-name">{session.user.name}</p>
                      <p className="pop-email">{session.user.email}</p>
                    </div>

                    <div className="popover-body">
                      {/* My Account Link */}
                      <Link 
                        href="/userprofile" 
                        className="pop-item" 
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUserCircle /> My Account
                      </Link>

                      {/* Become a Seller */}
                      <Link 
                        href="/sellersignup" 
                        className="pop-item" 
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaStore /> Become a Seller
                      </Link>

                      {/* Designer Sign Up */}
                      <Link 
                        href="/designersignup" 
                        className="pop-item" 
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaPalette /> I am a Designer
                      </Link>
                    </div>

                    <div className="popover-footer">
                      <button className="pop-signout" onClick={() => signOut()}>
                        SignOut <FaSignOutAlt />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE HAMBURGER */}
            <div className="hamburger always-visible" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* DRAWER MENU */}
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li className="drawer-link">
                <Link href="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
              </li>
              <li className="drawer-link">
                <Link href="/designers" onClick={() => setMenuOpen(false)}>Designers</Link>
              </li>

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

      {/* SEARCH BAR SECTION */}
      {!isHomePage && !isContactPage && (
        <div className="search-container">
          <form onSubmit={handleSearch} className="search_form">
            <input
              className="search_input"
              type="text"
              placeholder={`Search ${currentPageTitle}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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