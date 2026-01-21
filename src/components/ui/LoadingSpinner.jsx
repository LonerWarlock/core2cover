import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="premium-loader"></div>
        {message && <p className="loader-text">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;