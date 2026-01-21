"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FaSearch,
  FaShoppingCart,
  FaSignOutAlt,
  FaStore,
  FaPalette,
  FaUserCircle
} from "react-icons/fa";
import { IoMdInformationCircle } from "react-icons/io";
import "./Navbar.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";

const BrandBold = ({ children }) => (
  <span className="brand brand-bold">{children}</span>
);

const Navbar = () => {
  const { data: session, status } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 1. Sync manual login data from localStorage on load
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    const id = localStorage.getItem("userId");

    startTransition(() => {
      if (email) {
        setLocalUser({ email, name, id });
      } else {
        setLocalUser(null);
      }
    });
  }, [pathname]); // Re-check on navigation

  // Determine if the user is logged in via EITHER method
  const isUserAuthenticated = status === "authenticated" || !!localUser;
  const displayUser = session?.user || localUser;

  const isDesignerSection =
    pathname.includes("/designers") || pathname.includes("/designer_info");
  const isHomePage = pathname === "/";
  const isContactPage = pathname === "/contact";
  const currentPageTitle = isDesignerSection ? "Professional Designers" : "Readymade Products";

  // Handle Responsive view detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) startTransition(() => setSearchQuery(q));
  }, [searchParams]);

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
  };

  const handleProfileToggle = () => {
    if (!isUserAuthenticated) {
      router.push("/login");
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
          <div className="nav-left">
            <Link
              href="/"
              className="nav-logo-link"
              draggable="true"
              style={{ textDecoration: "none", color: "inherit" }}
            >
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
            </Link>
          </div>

          <div className="nav-right">
            <div className="nav-icons-desktop">
              <div className="ico">
                <IoMdInformationCircle className="info-icon-themed" />
                <Link href="/about" className="nav-icon-link">About Us</Link>
              </div>
              <div className="ico">
                <FaUserGraduate className="info-icon-themed" />
                <Link href="/designers" className="nav-icon-link designers">Designers</Link>
              </div>

              {/* Only show Cart here if NOT on mobile */}
              {!isMobile && (
                <div className="ico">
                  <FaShoppingCart className="info-icon-themed" />
                  <Link href="/cart" className="nav-icon-link">Cart</Link>
                </div>
              )}

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

                {profileOpen && isUserAuthenticated && (
                  <div className="profile-popover shadow-reveal">
                    <div className="popover-header">
                      <p className="pop-name">{displayUser?.name || "User"}</p>
                      <p className="pop-email">{displayUser?.email}</p>
                    </div>

                    <div className="popover-body">
                      <Link
                        href="/userprofile"
                        className="pop-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUserCircle /> My Account
                      </Link>

                      {/* CART ADDED HERE FOR MOBILE VIEW */}
                      {isMobile && (
                        <Link href="/cart" className="pop-item" onClick={() => setProfileOpen(false)}>
                          <FaShoppingCart /> My Cart
                        </Link>
                      )}

                      <Link href="/sellersignup" className="pop-item" onClick={() => setProfileOpen(false)}>
                        <FaStore /> Become a Seller
                      </Link>
                      <Link
                        href="/designersignup"
                        className="pop-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaPalette /> I am a Designer
                      </Link>
                    </div>

                    <div className="popover-footer">
                      <button className="pop-signout" onClick={handleSignOut}>
                        SignOut <FaSignOutAlt />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

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
            <button
              type="submit"
              className="search_button"
              disabled={!searchQuery.trim()}
            >
              <FaSearch />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Navbar;
