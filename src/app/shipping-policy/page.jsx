import LegalLayout from "@/components/ui/LegalLayout";

export default function ShippingPolicy() {
  return (
    <LegalLayout title="Shipping and Delivery Policy" lastUpdated="24 Jan 2026">
      <section>
        <h3>1. Shipping Coverage</h3>
        <p>
          Core2Cover facilitates delivery services across [Your State/India]. Shipping availability for specific 
          locations is determined by the Seller's delivery coverage or our integrated logistics partners. 
          You can verify delivery availability by entering your pincode on the product page.
        </p>

        <h3>2. Delivery Responsibility</h3>
        <p>
          Delivery may be handled either by the Seller directly or by Core2Cover’s logistics partners. 
          The responsible party for a specific order will be mentioned in your order confirmation details.
        </p>

        <h3>3. Estimated Delivery Timelines</h3>
        <p>We strive to deliver your orders as quickly as possible. The standard timelines are:</p>
        <ul>
          <li><strong>Readymade Interior Products:</strong> Typically delivered within 5-10 business days.</li>
          <li><strong>Raw Materials:</strong> Typically delivered within 3-7 business days, depending on stock availability and logistics requirements.</li>
        </ul>
        <p>
          <em>Note: Delivery times may vary based on the Seller's location, the volume of the order, 
          and the specific requirements for handling raw materials (e.g., Plywood, Glass).</em>
        </p>

        <h3>4. Shipping Charges</h3>
        <p>
          Shipping charges are calculated dynamically based on the weight, dimensions, and delivery distance. 
          For Raw Materials, charges may be calculated "Per Trip" depending on the vehicle requirement. 
          All applicable charges will be displayed clearly at the checkout before you make a payment.
        </p>

        <h3>5. Order Tracking</h3>
        <p>
          Once your order is dispatched, you will receive an update via email/SMS. You can also track 
          the status of your delivery through the "My Orders" section in your Customer Dashboard.
        </p>

        <h3>6. Delivery Attempts</h3>
        <p>
          Our delivery partners will attempt delivery a maximum of two times. Please ensure someone 
          is available at the provided address to receive the material. In case of failed deliveries due 
          to customer unavailability, additional shipping charges may apply for re-delivery.
        </p>

        <h3>7. Damaged Goods</h3>
        <p>
          If you receive materials that appear damaged during transit, please take photographs 
          immediately and report the issue through our Refund Policy portal within 48 hours of delivery.
        </p>
      </section>
    </LegalLayout>
  );
}