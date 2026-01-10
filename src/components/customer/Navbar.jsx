// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";  
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

const Navbar = () => {
  const Brand = ({ children }) => <span className="brand">{children}</span>;

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const currentPageTitle = location.state?.page || "Readymade Products";

  /* =========================
     SYNC SEARCH WITH URL
  ========================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setSearchQuery(q);
  }, [location.search]);

  /* =========================
     HANDLE SEARCH
  ========================= */
  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/searchresults?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="nav-link nav-logo-link">
              <span className="nav-logo-wrap">
                <img
                  src={CoreToCoverLogo}
                  alt="CoreToCover"
                  className="nav-logo"
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
                <Link to="/userprofile" className="nav-link">
                  <FaUser /> Profile
                </Link>
              </li>

              <li>
                <Link to="/myhireddesigners" className="nav-link">
                  <FaUserGraduate /> My Hired Designers
                </Link>
              </li>

              <li>
                <Link to="/cart" className="cart-btn">
                  <FaShoppingCart /> Cart
                </Link>
              </li>

              <li>
                <Link to="/sellersignup" className="seller-btn">
                  Become a Seller
                </Link>
              </li>

              <li>
                <Link to="/designersignup" className="seller-btn">
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
          {/* <FaSearch className="search-ico" /> */}
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
