"use client";

import React from 'react';
import Link from 'next/link'; // CHANGED
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Footer.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <Image
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="footer-logo"
            width={200}
            height={60}
          />
          <p className="footer-tagline">
            Everything your interior project needs, in one place.
          </p>
        </div>

        {/* Links */}
        <ul className="footer-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>

        {/* Social Icons */}
        <div className="footer-social">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaTwitter /></a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Core2Cover. All rights reserved.
      </div>
    </footer>
  );
}