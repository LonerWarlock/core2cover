"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FaUserCircle,
  FaUserGraduate
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
  const [isMobile, setIsMobile] = useState(false);
  const [localUser, setLocalUser] = useState(null); 
  const dropdownRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    const id = localStorage.getItem("userId");

    if (email) {
      setLocalUser({ email, name, id });
    } else {
      setLocalUser(null);
    }
  }, [pathname]); 

  const isUserAuthenticated = status === "authenticated" || !!localUser;
  const displayUser = session?.user || localUser;

  // Identifying the current section
  const isDesignerSection = pathname.includes("/designers") || pathname.includes("/designer_info");
  
  // Logic to identify if we are on the Raw Materials page (assuming based on search params or path)
  const isRawMaterialsPage = searchParams.get("page") === "Raw Materials";
  
  const isHomePage = pathname === "/";
  const isContactPage = pathname === "/contact";
  
  const currentPageTitle = isDesignerSection 
    ? "Professional Designers" 
    : isRawMaterialsPage 
      ? "Raw Materials" 
      : "Readymade Products";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================================
      UPDATED: CONDITIONAL "NEAR ME" LOGIC
  ========================================= */
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let query = formData.get("search")?.toString().trim();
    if (!query) return;

    const lowerQuery = query.toLowerCase();
    const hasNearMe = lowerQuery.includes("near me");

    // ONLY trigger Geolocation if "near me" is typed AND we are in the Raw Materials context
    if (hasNearMe && isRawMaterialsPage) {
      const cleanQuery = lowerQuery.replace("near me", "").trim();
      
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            router.push(`/searchresults?search=${encodeURIComponent(cleanQuery)}&lat=${latitude}&lng=${longitude}&nearby=true&page=Raw%20Materials`);
          },
          (error) => {
            console.error("Location error", error);
            router.push(`/searchresults?search=${encodeURIComponent(query)}&page=Raw%20Materials`);
          }
        );
      } else {
        router.push(`/searchresults?search=${encodeURIComponent(query)}&page=Raw%20Materials`);
      }
    } else {
      // Normal search for Designers or Finished Products (even if they type 'near me')
      const targetPath = isDesignerSection ? "/designers" : "/searchresults";
      const pageParam = isRawMaterialsPage ? "&page=Raw%20Materials" : "";
      router.push(`${targetPath}?search=${encodeURIComponent(query)}${pageParam}`);
    }
  };

  const handleProfileToggle = () => {
    if (!isUserAuthenticated) {
      router.push("/login");
    } else {
      setProfileOpen(!profileOpen);
    }
  };

  const handleSignOut = async () => {
    localStorage.clear();
    setLocalUser(null);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-logo-link">
              <span className="nav-logo-wrap">
                <Image src={CoreToCoverLogo} alt="Logo" width={50} height={50} priority />
                <BrandBold>Core2Cover</BrandBold>
              </span>
            </Link>
          </div>

          <div className="nav-right">
            <div className="nav-icons-desktop">
              <Link href="/about" className="nav-link-wrapper">
                <div className="ico">
                  <IoMdInformationCircle className="info-icon-themed" />
                  <span className="nav-icon-link">About</span>
                </div>
              </Link>
              
              <Link href="/designers" className="nav-link-wrapper">
                <div className="ico">
                  <FaUserGraduate className="info-icon-themed" />
                  <span className="nav-icon-link">Designers</span>
                </div>
              </Link>

              {!isMobile && (
                <Link href="/cart" className="nav-link-wrapper">
                  <div className="ico">
                    <FaShoppingCart className="info-icon-themed" />
                    <span className="nav-icon-link">Cart</span>
                  </div>
                </Link>
              )}

              <div className="profile-dropdown-container" ref={dropdownRef}>
                <div className="nav-profile-trigger" onClick={handleProfileToggle}>
                  <div className="ico">
                    {displayUser?.image ? (
                      <Image src={displayUser.image} alt="User" className="nav-user-avatar" width={35} height={35} unoptimized />
                    ) : (
                      <FaUserCircle className="info-icon-themed" />
                    )}
                  </div>
                </div>

                {profileOpen && isUserAuthenticated && (
                  <div className="profile-popover shadow-reveal">
                    <div className="popover-header">
                      <p className="pop-name">{displayUser?.name || "User"}</p>
                      <p className="pop-email">{displayUser?.email}</p>
                    </div>
                    <div className="popover-body">
                      <Link href="/userprofile" className="pop-item" onClick={() => setProfileOpen(false)}>
                        <FaUserCircle /> My Account
                      </Link>
                      {isMobile && (
                        <Link href="/cart" className="pop-item" onClick={() => setProfileOpen(false)}>
                          <FaShoppingCart /> My Cart
                        </Link>
                      )}
                      <Link href="/sellersignup" className="pop-item" onClick={() => setProfileOpen(false)}>
                        <FaStore /> Become a Seller
                      </Link>
                      <Link href="/designersignup" className="pop-item" onClick={() => setProfileOpen(false)}>
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
              name="search"
              className="search_input"
              type="text"
              placeholder={`Search ${currentPageTitle}...`}
              defaultValue={searchQuery}
              key={searchQuery}
            />
            <button type="submit" className="search_button">
              <FaSearch />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Navbar;