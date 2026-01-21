"use client";

import React from 'react';
import Image from 'next/image';
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import "./Footer.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";


const BrandBold = ({ children }) => (
  <span className="brand brand-bold">{children}</span>
);
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left: Brand & Tagline */}
        <div className="footer-brand">
          <span>
            <Image
              src={CoreToCoverLogo}
              alt="CoreToCover"
              className="footer-logo"
              width={180}
              height={45}
              priority
            />
            <BrandBold>Core2Cover</BrandBold>
          </span>
          <p className="footer-tagline">
            From Design To Finish - In One Place.
          </p>
        </div>
        {/* Right: Copyright */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} Core2Cover. All rights reserved.
        </div>

        {/* Center: Social Icons */}
        <div className="footer-social">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.instagram.com/core2cover?igsh=ODdldnJnaHg3eXMz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://x.com/Core2Cover"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <FaXTwitter />
          </a>
          {/* Note: Internal links like "/contact" usually stay in the same tab */}
          <a href="/contact" aria-label="Email">
            <MdEmail />
          </a>
        </div>

      </div>
    </footer>
  );
}