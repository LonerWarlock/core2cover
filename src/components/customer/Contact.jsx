"use client";
import React, { useState } from "react";
import Navbar from "./Navbar";
import "./Contact.css";
import { sendContactMessage } from "../../api/contact";
import Footer from "./Footer";
import MessageBox from "../ui/MessageBox"; // Ensure path is correct

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "success", show: false });

    const triggerMsg = (text, type = "success") => {
        setMsg({ text, type, show: true });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            triggerMsg("Please fill in all fields before submitting.", "error");
            return;
        }

        try {
            setLoading(true);
            await sendContactMessage(formData);
            
            triggerMsg("Thank you for reaching out! We'll get back to you soon.", "success");
            setFormData({ name: "", email: "", message: "" });
        } catch (err) {
            const errorText = err?.response?.data?.message || "Failed to send message. Please try again.";
            triggerMsg(errorText, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            {msg.show && (
                <MessageBox
                    message={msg.text}
                    type={msg.type}
                    onClose={() => setMsg({ ...msg, show: false })}
                />
            )}
            
            <section className="contact-page">
                <div className="contact-container">
                    <div className="contact-left">
                        <h2>Contact Us</h2>
                        <p>
                            Have a question, feedback, or partnership idea?
                            We'd love to hear from you! Please fill out the form below.
                        </p>

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="information-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Write your message here..."
                                    rows={5}
                                />
                            </div>

                            <button type="submit" className="contact-btn" disabled={loading}>
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                        
                        <a href="tel:+919322611145">
                            <button className="pd-btn pd_btn_call">📞 Call Us</button>
                        </a>
                    </div>

                    <div className="contact-right">
                        <h3>Get in Touch</h3>
                        <p><strong>Email:</strong> team.core2cover@gmail.com</p>
                        <p><strong>Phone:</strong> +91 8275922422</p>
                        <p><strong>Office Address:</strong> Vishrambag, Sangli, Maharashtra, India</p>

                        <div className="contact-map">
                            <iframe
                                title="map"
                                src="https://maps.google.com/maps?q=Vishrambag,Sangli&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>
            <Footer/>
        </>
    );
};

export default Contact;