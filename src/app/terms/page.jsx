import LegalLayout from "@/components/ui/LegalLayout";

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms and Conditions" lastUpdated="24 Jan 2026">
      <section>
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing and using Core2Cover, you agree to be bound by these Terms and Conditions. 
          Our platform facilitates the sale of readymade interior products, interior raw materials and the hiring of interior designers. 
          If you do not agree with any part of these terms, you must not use our services.
        </p>

        <h3>2. User Accounts</h3>
        <p>
          To access certain features, you must register for an account. You are responsible for 
          maintaining the confidentiality of your account credentials. You agree to provide accurate, 
          current, and complete information during the registration process.
        </p>

        {/* NEW SECTION: Verification & Approval */}
        <h3>3. Content Verification & Approval</h3>
        <p>
          To maintain high standards of quality and authenticity on our marketplace, all listings 
          undergo a mandatory internal review process:
        </p>
        <ul>
          <li><strong>Seller Products:</strong> When a Seller adds a new product (Readymade or Raw Material), it will be held in a "Pending" state. Our team will verify the product details, images, and pricing before it is displayed to Customers.</li>
          <li><strong>Designer Profiles:</strong> When a Designer creates a profile or adds portfolio work, it will be reviewed for professional standards and authenticity before being made visible to potential clients.</li>
        </ul>
        <p>
          Core2Cover reserves the right to reject any listing or profile that does not meet our 
          guidelines or lacks sufficient information.
        </p>

        <h3>4. Marketplace Platform</h3>
        <p>
          Core2Cover acts as a platform to connect Customers with Sellers (Material Vendors) and 
          Designers. We do not manufacture materials or provide direct design services. 
          Contracts for sale or hire are strictly between the users.
        </p>

        <h3>5. Payments and Shipping</h3>
        <p>
          All payments are processed securely. Prices listed are inclusive of applicable 
          taxes unless stated otherwise. 
        </p>
        <p>
          <strong>Delivery Timelines:</strong> Sellers are required to provide estimated timelines for 
          delivery. Generally, Readymade Products are delivered within 5-10 business days, and Raw 
          Materials within 3-7 business days. Users agree that these are estimates and may vary 
          based on stock levels and logistics requirements.
        </p>

        <h3>6. Intellectual Property</h3>
        <p>
          The content on this website, including logos, designs, text, and graphics, is the property 
          of Core2Cover. Users (Designers/Sellers) retain rights to their uploaded portfolio images 
          but grant Core2Cover a license to display them for marketing purposes.
        </p>

        <h3>7. Limitation of Liability</h3>
        <p>
          Core2Cover shall not be liable for any indirect, incidental, or consequential damages 
          arising from the use of materials purchased or services hired through the platform.
        </p>

        <h3>8. Governing Law</h3>
        <p>
          These terms are governed by and construed in accordance with the laws of India. Any 
          disputes shall be subject to the exclusive jurisdiction of the courts in Maharashtra.
        </p>
      </section>
    </LegalLayout>
  );
}