"use client";

import React, { useEffect, useState } from "react";
import "./SellerDeliveryUpdate.css";
import Sidebar from "./Sidebar";
import {
    getSellerDeliveryDetails,
    saveSellerDeliveryDetails,
} from "../../api/seller";
import MessageBox from "../ui/MessageBox";

const SellerDeliveryUpdate = () => {
    // 1. Add a mounted state to track if we are on the client
    const [mounted, setMounted] = useState(false);
    const [sellerId, setSellerId] = useState(null);
    const [msg, setMsg] = useState({ text: "", type: "success", show: false });

    const emptyDelivery = {
        deliveryResponsibility: "",
        deliveryCoverage: "",
        deliveryType: "",
        deliveryTimeMin: "",
        deliveryTimeMax: "",
        shippingChargeType: "",
        shippingCharge: "",
        internationalDelivery: false,
        installationAvailable: "",
        installationCharge: "",
    };

    const [delivery, setDelivery] = useState(emptyDelivery);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const triggerMsg = (text, type = "success") => {
        setMsg({ text, type, show: true });
    };

    // 2. Handle Hydration and Storage safely
    useEffect(() => {
        setMounted(true); // Signal that we are now on the client
        const sid = localStorage.getItem("sellerId");
        if (sid) {
            setSellerId(sid);
        } else {
            setLoading(false);
        }
    }, []);

    // 3. Fetch existing details
    useEffect(() => {
        if (!sellerId) return;

        getSellerDeliveryDetails(sellerId)
            .then((res) => {
                const data = res.data;
                if (data) {
                    setDelivery({
                        ...data,
                        installationAvailable:
                            data.installationAvailable === true ||
                            data.installationAvailable === "yes"
                                ? "yes"
                                : "no",
                        internationalDelivery:
                            data.internationalDelivery === true ||
                            data.internationalDelivery === "yes",
                    });
                    setIsEditMode(true);
                }
            })
            .catch(() => {
                setDelivery(emptyDelivery);
                setIsEditMode(false);
            })
            .finally(() => setLoading(false));
    }, [sellerId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDelivery((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await saveSellerDeliveryDetails({
                sellerId: Number(sellerId),
                ...delivery,
            });
            triggerMsg(
                isEditMode
                    ? "Delivery details updated successfully "
                    : "Delivery details saved successfully ",
                "success"
            );
        } catch {
            triggerMsg("Failed to save delivery details", "error");
        }
    };

    // 4. PREVENT HYDRATION ERROR: 
    // Return null or a loader until the component has mounted on the client
    if (!mounted) return null;

    if (loading) return (
        <div className="ms-root">
            <Sidebar />
            <div className="delivery-container">
                <div className="delivery-card">
                    <p>Initialising delivery settings...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="ms-root">
            {msg.show && (
                <MessageBox 
                    message={msg.text} 
                    type={msg.type} 
                    onClose={() => setMsg({ ...msg, show: false })} 
                />
            )}
            <Sidebar />

            <div className="delivery-container">
                <div className="delivery-card">
                    <h2>{isEditMode ? "Update Delivery Details" : "Add Delivery Details"}</h2>
                    <p>{isEditMode ? "Manage how you deliver products to customers" : "Add delivery details to start selling"}</p>

                    <form onSubmit={handleSubmit}>
                        {/* Responsibility */}
                        <div className="input-group">
                            <label>Who will deliver the product? *</label>
                            <select name="deliveryResponsibility" value={delivery.deliveryResponsibility} onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="seller">Seller</option>
                                <option value="courier">Courier Partner</option>
                            </select>
                        </div>

                        {/* Coverage */}
                        <div className="input-group">
                            <label>Delivery Coverage *</label>
                            <select name="deliveryCoverage" value={delivery.deliveryCoverage} onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="pan-india">PAN India</option>
                                <option value="selected-states">Selected States</option>
                                <option value="selected-cities">Selected Cities</option>
                            </select>
                        </div>

                        {/* Type */}
                        <div className="input-group">
                            <label>Delivery Type *</label>
                            <select name="deliveryType" value={delivery.deliveryType} onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="courier">Courier / Surface</option>
                                <option value="seller-transport">Seller Transport</option>
                            </select>
                        </div>

                        {/* Times */}
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Delivery Time (Min days)</label>
                                <input type="number" name="deliveryTimeMin" value={delivery.deliveryTimeMin} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Delivery Time (Max days)</label>
                                <input type="number" name="deliveryTimeMax" value={delivery.deliveryTimeMax} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Shipping Charges */}
                        <div className="input-group">
                            <label>Shipping Charges *</label>
                            <select name="shippingChargeType" value={delivery.shippingChargeType} onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="free">Free</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </div>

                        {delivery.shippingChargeType === "fixed" && (
                            <div className="input-group">
                                <label>Shipping Charge (₹)</label>
                                <input type="number" name="shippingCharge" value={delivery.shippingCharge} onChange={handleChange} />
                            </div>
                        )}

                        {/* Installation */}
                        <div className="input-group">
                            <label>Installation Available *</label>
                            <select name="installationAvailable" value={delivery.installationAvailable} onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        {delivery.installationAvailable === "yes" && (
                            <div className="input-group">
                                <label>Installation Charge (₹)</label>
                                <input type="number" name="installationCharge" value={delivery.installationCharge} onChange={handleChange} />
                            </div>
                        )}

                        <div className="input-group checkbox">
                            <input type="checkbox" name="internationalDelivery" id="intl-check" checked={delivery.internationalDelivery} onChange={handleChange} />
                            <label htmlFor="intl-check">Can deliver internationally</label>
                        </div>

                        <button className="primary-btn" type="submit">
                            {isEditMode ? "Update Details" : "Save Details"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerDeliveryUpdate;