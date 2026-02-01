import React from "react";
import Sidebar from "./Sidebar";
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerDeliveryForm = ({ delivery, setDelivery, onSubmit, submitLabel, loading }) => {
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDelivery({
            ...delivery,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Logic: Check if Core2Cover is selected
    const isC2CManaged = delivery.deliveryResponsibility === "core2cover";

    return (
        <>
            {loading && <LoadingSpinner message="Updating delivery preferences..." />}

            <div className="ms-root">
                <Sidebar />
                <div className="business_container">
                    <div className="business-card business-reveal">
                        <h2>Edit Delivery Details</h2>
                        <p>Update how you handle logistics and installation</p>

                        <form onSubmit={onSubmit}>
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
                                    {/* ADDED OPTION */}
                                    <option value="core2cover">Core2Cover Delivery</option>
                                </select>
                            </div>

                            {/* Conditional Disabling of subsequent fields */}
                            <div className="input-group">
                                <label>Delivery Coverage *</label>
                                <select
                                    name="deliveryCoverage"
                                    value={delivery.deliveryCoverage}
                                    onChange={handleChange}
                                    required={!isC2CManaged}
                                    disabled={isC2CManaged}
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
                                    required={!isC2CManaged}
                                    disabled={isC2CManaged}
                                >
                                    <option value="">Select</option>
                                    <option value="courier">Courier / Surface</option>
                                    <option value="seller-transport">Seller Transport</option>
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
                                        disabled={isC2CManaged}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Delivery Time (Max days)</label>
                                    <input
                                        type="number"
                                        name="deliveryTimeMax"
                                        value={delivery.deliveryTimeMax}
                                        onChange={handleChange}
                                        disabled={isC2CManaged}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Shipping Charges *</label>
                                <select
                                    name="shippingChargeType"
                                    value={delivery.shippingChargeType}
                                    onChange={handleChange}
                                    required={!isC2CManaged}
                                    disabled={isC2CManaged}
                                >
                                    <option value="">Select</option>
                                    <option value="free">Free</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                            </div>

                            {delivery.shippingChargeType === "fixed" && !isC2CManaged && (
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

                            <div className="checkbox-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px', opacity: isC2CManaged ? 0.5 : 1 }}>
                                <input
                                    type="checkbox"
                                    name="internationalDelivery"
                                    id="intl-check"
                                    checked={delivery.internationalDelivery}
                                    onChange={handleChange}
                                    disabled={isC2CManaged}
                                />
                                <label htmlFor="intl-check">Can deliver internationally</label>
                            </div>

                            <div className="input-group">
                                <label>Installation Available?</label>
                                <select
                                    name="installationAvailable"
                                    value={delivery.installationAvailable}
                                    onChange={handleChange}
                                    disabled={isC2CManaged}
                                >
                                    <option value="">Select</option>
                                    <option value="no">No</option>
                                    <option value="free">Yes – Free</option>
                                    <option value="paid">Yes – Paid</option>
                                </select>
                            </div>

                            {delivery.installationAvailable === "paid" && !isC2CManaged && (
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

                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? "Saving Changes..." : submitLabel}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SellerDeliveryForm;