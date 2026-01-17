"use client";

import React, { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./MessageBox.css";

const MessageBox = ({ message, type = "success", onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    info: <FaInfoCircle />,
  };

  return (
    <div className={`message-box-wrapper ${type}`}>
      <div className="message-box-glass">
        <div className="message-icon-wrapper">{icons[type]}</div>
        <div className="message-content">
          <p className="message-text">{message}</p>
        </div>
        <button className="message-close-minimal" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div 
          className="message-progress-glow" 
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};

export default MessageBox;