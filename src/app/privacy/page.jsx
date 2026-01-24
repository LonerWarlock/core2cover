import LegalLayout from "@/components/ui/LegalLayout";

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="24 Jan 2026">
            <section>
                <h3>1. Information We Collect</h3>
                <p>
                    We collect personal information that you provide to us, such as your name, email address,
                    phone number, and shipping address. For Sellers and Designers, we also collect business
                    details and portfolio information.
                </p>

                <h3>2. How We Use Your Information</h3>
                <ul>
                    <li>To facilitate orders between customers and sellers.</li>
                    <li>To process payments via our secure gateway (Razorpay).</li>
                    <li>To provide customer support and send order updates.</li>
                    <li>To improve our platform and user experience.</li>
                </ul>

                <h3>3. Sharing of Information</h3>
                <p>
                    We share your contact and delivery information with Sellers to fulfill your orders.
                    We do not sell your personal data to third parties. We may disclose information if required
                    by law or to protect our rights.
                </p>

                <h3>4. Data Security</h3>
                <p>
                    We implement industry-standard security measures to protect your data. Your passwords
                    and sensitive session data are encrypted. However, no method of transmission over the
                    internet is 100% secure.
                </p>

                <h3>5. Cookies</h3>
                <p>
                    We use cookies to maintain your login session and remember your preferences. You can
                    choose to disable cookies through your browser settings, but it may affect platform
                    functionality.
                </p>
                <ul>
                    <li><strong>Authentication:</strong> We use cookies to keep you logged into your account as you navigate different pages.</li>
                    <li><strong>Security:</strong> Cookies help us detect and prevent fraudulent activities on our platform.</li>
                    <li><strong>Preferences:</strong> We use them to remember your settings for a more personalized experience.</li>
                </ul>

                <h3>6. Third-Party Services</h3>
                <p>
                    Our platform uses Google Maps for location services and Razorpay for payments. These
                    third parties have their own privacy policies regarding how they handle your data.
                </p>

                <h3>7. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at
                    <strong> support@core2cover.com</strong>.
                </p>
            </section>
        </LegalLayout>
    );
}