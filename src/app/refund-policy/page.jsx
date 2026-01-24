import LegalLayout from "@/components/ui/LegalLayout";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund and Cancellation Policy" lastUpdated="24 Jan 2026">
      <h3>1. Cancellation</h3>
      <p>Orders for interior materials can be cancelled before the order is out for delivery. Once dispatched, cancellations are not accepted.</p>
      
      <h3>2. Returns</h3>
      <p>We offer a 7-day return policy for manufacturing defects or damage during transit. Images of the damaged material must be uploaded via the "Return Request" section.</p>
      
      <h3>3. Refunds</h3>
      <p>Once a return is approved by the seller and finalized by our admin, the refund will be processed to your original payment method within 7-10 working days.</p>
    </LegalLayout>
  );
}