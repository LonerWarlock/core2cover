import React, { useState } from "react";
import Navbar from "./Navbar";
import "./Contact.css";
import { sendContactMessage } from "../../api/contact";
import Footer from "./Footer";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            alert("Please fill in all fields before submitting.");
            return;
        }

        try {
            await sendContactMessage(formData);
            alert("Thank you for reaching out! We'll get back to you soon.");
            setFormData({ name: "", email: "", message: "" });
        } catch (err) {
            alert(
                err?.response?.data?.message ||
                "Failed to send message. Please try again."
            );
        }
    };

    return (
        <>
            <Navbar />
            <section className="contact-page">
                <div className="contact-container">
                    <div className="contact-left">
                        <h2>Contact Us</h2>
                        <p>
                            Have a question, feedback, or partnership idea?
                            We'd love to hear from you! Please fill out the form below and
                            we’ll get in touch soon.
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
                                />
                            </div>

                            <button type="submit" className="contact-btn">
                                Send Message
                            </button>

                        </form>
                        <a href="tel:+919322611145">
                            <button className="pd-btn pd-btn-call">📞 Call Us</button>
                        </a>
                    </div>

                    <div className="contact-right">
                        <h3>Get in Touch</h3>
                        <p><strong>Email:</strong> team.casa.in@gmail.com</p>
                        <p><strong>Phone:</strong> +91 8275922422</p>
                        <p><strong>Office Address:</strong>
                            Vishrambag, Sangli, Maharashtra, India
                        </p>

                        <div className="contact-map">
                            <iframe
                                title="map"
                                src="https://www.google.com/maps?q=Vishrambag ,Sangli,Maharashtra&output=embed"
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
