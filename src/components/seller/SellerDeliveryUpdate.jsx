import React, { useEffect, useState } from "react";
import "./SellerDeliveryUpdate.css";
import Sidebar from "./Sidebar";
import {
    getSellerDeliveryDetails,
    saveSellerDeliveryDetails,
} from "../../api/seller";

const SellerDeliveryUpdate = () => {
    const sellerId = localStorage.getItem("sellerId");

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

    // ✅ SINGLE, VALID useEffect
    useEffect(() => {
        if (!sellerId) return;

        getSellerDeliveryDetails(sellerId)
            .then((res) => {
                const data = res.data;

                setDelivery({
                    ...data,
                    // ensure STRING for select
                    installationAvailable:
                        data.installationAvailable === true ||
                            data.installationAvailable === "yes"
                            ? "yes"
                            : "no",

                    // ensure BOOLEAN for checkbox
                    internationalDelivery:
                        data.internationalDelivery === true ||
                        data.internationalDelivery === "yes",
                });

                setIsEditMode(true);
            })

            .catch(() => {
                // 404 = first time seller
                setDelivery(emptyDelivery);
                setIsEditMode(false); // add mode
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

            alert(
                isEditMode
                    ? "Delivery details updated ✅"
                    : "Delivery details saved ✅"
            );
        } catch {
            alert("Failed to save delivery details");
        }
    };

    if (loading) return null;

    return (
        <div className="ms-root">
            <Sidebar />

            <div className="delivery-container">
                <div className="delivery-card">
                    <h2>
                        {isEditMode
                            ? "Update Delivery Details"
                            : "Add Delivery Details"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Manage how you deliver products"
                            : "Add delivery details to start selling"}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Who will deliver the product? *</label>
                            <select
                                name="deliveryResponsibility"
                                value={delivery.deliveryResponsibility}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select</option>
                                <option value="seller">Seller</option>
                                <option value="courier">Courier Partner</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Delivery Coverage *</label>
                            <select
                                name="deliveryCoverage"
                                value={delivery.deliveryCoverage}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select</option>
                                <option value="pan-india">PAN India</option>
                                <option value="selected-states">Selected States</option>
                                <option value="selected-cities">Selected Cities</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Delivery Type *</label>
                            <select
                                name="deliveryType"
                                value={delivery.deliveryType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select</option>
                                <option value="courier">Courier / Surface</option>
                                <option value="seller-transport">
                                    Seller Transport
                                </option>
                            </select>
                        </div>

                        <div className="grid-2">
                            <div className="input-group">
                                <label>Delivery Time (Min days)</label>
                                <input
                                    type="number"
                                    name="deliveryTimeMin"
                                    value={delivery.deliveryTimeMin}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <label>Delivery Time (Max days)</label>
                                <input
                                    type="number"
                                    name="deliveryTimeMax"
                                    value={delivery.deliveryTimeMax}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Shipping Charges *</label>
                            <select
                                name="shippingChargeType"
                                value={delivery.shippingChargeType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select</option>
                                <option value="free">Free</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Installation Available *</label>
                            <select
                                name="installationAvailable"
                                value={delivery.installationAvailable}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        {delivery.installationAvailable === "yes" && (
                            <div className="input-group">
                                <label>Installation Charge (₹)</label>
                                <input
                                    type="number"
                                    name="installationCharge"
                                    value={delivery.installationCharge}
                                    onChange={handleChange}
                                />
                            </div>
                        )}


                        {delivery.shippingChargeType === "fixed" && (
                            <div className="input-group">
                                <label>Shipping Charge (₹)</label>
                                <input
                                    type="number"
                                    name="shippingCharge"
                                    value={delivery.shippingCharge}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className="input-group checkbox">
                            <input
                                type="checkbox"
                                name="internationalDelivery"
                                checked={delivery.internationalDelivery}
                                onChange={handleChange}
                            />
                            <label>Can deliver internationally</label>
                        </div>



                        <button className="primary-btn" type="submit">
                            {isEditMode
                                ? "Update Delivery Details"
                                : "Save Delivery Details"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerDeliveryUpdate;
