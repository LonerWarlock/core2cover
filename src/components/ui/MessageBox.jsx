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
    <div className={`message-box-container ${type}`}>
      <div className="message-icon">{icons[type]}</div>
      <div className="message-text">{message}</div>
      <button className="message-close" onClick={onClose}>
        <FaTimes />
      </button>
      <div className="message-progress-bar"></div>
    </div>
  );
};

export default MessageBox;