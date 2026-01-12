"use client";

import React from 'react';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./Footer.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_1.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left: Brand & Tagline */}
        <div className="footer-brand">
          <Image
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="footer-logo"
            width={180}
            height={45}
            priority
          />
          <p className="footer-tagline">
            From design to finish, in one place
          </p>
        </div>
        {/* Right: Copyright */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} Core2Cover. All rights reserved.
        </div>

        {/* Center: Social Icons */}
        <div className="footer-social">
          <a href="#" aria-label="Facebook"><FaFacebookF /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" aria-label="Twitter"><FaTwitter /></a>
          <a href="/contact" aria-label="Email"><MdEmail /></a>
        </div>

      </div>
    </footer>
  );
}