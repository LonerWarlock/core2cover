"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./BusinessDetails.css";
import { createSellerBusinessDetails } from "../../api/seller";
import MessageBox from "../ui/MessageBox";
import LoadingSpinner from "../ui/LoadingSpinner";

// Google Maps Imports
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";

const LIBRARIES = ["places", "maps"];
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
  marginTop: "10px",
  border: "1px solid #ddd"
};
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

const BusinessDetails = () => {
  const router = useRouter();
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [business, setBusiness] = useState({
    businessName: "",
    sellerType: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
  });

  const [markerPosition, setMarkerPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("sellerId");
      setSellerId(storedId);
    }
  }, []);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusiness({ ...business, [name]: value });
  };

  // Logic: Parse address components from Google Place result
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return;

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      setMarkerPosition(location);
      mapRef.current.panTo(location);

      let cityName = "", stateName = "", postCode = "";

      place.address_components.forEach(comp => {
        if (comp.types.includes("locality")) cityName = comp.long_name;
        if (comp.types.includes("administrative_area_level_1")) stateName = comp.long_name;
        if (comp.types.includes("postal_code")) postCode = comp.long_name;
      });

      setBusiness(prev => ({
        ...prev,
        address: place.formatted_address,
        city: cityName,
        state: stateName,
        pincode: postCode
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!business.businessName || !business.sellerType) {
      triggerMsg("Please fill all required fields.", "error");
      return;
    }

    if (!sellerId) {
      triggerMsg("Seller session expired. Please sign up again.", "error");
      setTimeout(() => router.push("/sellerlogin"), 2000);
      return;
    }

    setLoading(true);
    try {
      await createSellerBusinessDetails({
        sellerId: Number(sellerId),
        ...business
      });

      triggerMsg("Business details saved successfully ", "success");
      setTimeout(() => router.push("/deliverydetails"), 2000);
    } catch (err) {
      triggerMsg(err?.response?.data?.message || "Failed to save details", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div className="error-msg">Error loading maps</div>;
  if (!isLoaded) return <LoadingSpinner message="Initialising Location Services..." />;

  return (
    <div className="business-container">
      {loading && <LoadingSpinner message="Finalising your business profile..." />}
      {msg.show && <MessageBox message={msg.text} type={msg.type} onClose={() => setMsg({ ...msg, show: false })} />}

      <div className="business-card business-reveal">
        <h2 className="business-title">Business Details</h2>
        <p className="business-sub">Verify your store location to start selling</p>

        <form onSubmit={handleSubmit} className="business-form">
          <div className="input-group">
            <label>Business / Store Name *</label>
            <input name="businessName" placeholder="e.g. Elegant Interiors" value={business.businessName} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>What do you sell? *</label>
            <select name="sellerType" value={business.sellerType} onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="interior-products">Interior Products</option>
              <option value="raw-materials">Raw Materials</option>
              <option value="both">Both</option>
            </select>
          </div>

          <hr className="divider" />
          <h4 className="section-subtitle">Store Location</h4>

          <div className="input-group">
            <label>Search Business Address</label>
            <Autocomplete onLoad={ref => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
              <input type="text" placeholder="Search for your shop or area..." className="map-search-input" />
            </Autocomplete>
          </div>

          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={markerPosition || defaultCenter}
            zoom={12}
            onLoad={map => (mapRef.current = map)}
            options={{
              streetViewControl: false,
              // 1. Set the initial view to Satellite or Hybrid
              mapTypeId: "hybrid", // "hybrid" shows satellite imagery with road names
              // 2. Enable the control so users can toggle between Map and Satellite
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: window.google.maps.ControlPosition.TOP_RIGHT,
              },
            }}
          >
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>

          <div className="input-group" style={{ marginTop: "15px" }}>
            <label>Confirm Full Address</label>
            <textarea name="address" rows="2" value={business.address} onChange={handleChange} placeholder="House/Shop No, Building, Area" />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>City</label>
              <input name="city" placeholder="City" value={business.city} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>State</label>
              <input name="state" placeholder="State" value={business.state} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Pincode</label>
              <input name="pincode" placeholder="6-digit code" value={business.pincode} onChange={handleChange} />
            </div>
            {/* <div className="input-group">
              <label>GST (optional)</label>
              <input name="gst" placeholder="GSTIN Number" value={business.gst} onChange={handleChange} />
            </div> */}
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Processing..." : "Finish & Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessDetails;