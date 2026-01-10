import React from 'react'
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Footer.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover.png";

export default function Footer() {
  const Brand = ({ children }) => <span className="brand">{children}</span>;

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <img
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="footer-logo"
          />
          <p className="footer-tagline">
            Everything your interior project needs, in one place.
          </p>
        </div>


        {/* Links */}
        <ul className="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          {/* <li><a href="#">Products</a></li>
          <li><a href="#">Suppliers</a></li> */}
          <li><a href="/contact">Contact</a></li>
        </ul>

        {/* Social Icons */}
        <div className="footer-social">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaTwitter /></a>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Core2Cover. All rights reserved.
      </div>
    </footer>
  );
}
