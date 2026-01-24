import LegalLayout from "@/components/ui/LegalLayout";

export default function RefundPolicy() {
    return (
        <LegalLayout title="Refund and Cancellation Policy" lastUpdated="24 Jan 2026">
            <h3>1. Return & Refund Responsibility</h3>
            <p>
                Core2Cover is a marketplace platform. Please note that the <strong>approval of any return request and the subsequent refund is solely at the discretion of the Seller</strong> from whom the product was purchased.
            </p>

            <h3>2. Return Process</h3>
            <p>
                We offer a 7-day return policy specifically for manufacturing defects or damage during transit.
                To initiate a return, images of the damaged material must be uploaded via the "Return Request" section in your customer dashboard.
            </p>

            <h3>3. Conditions for Refund</h3>
            <p>
                <strong>Double Approval Process:</strong> For a return to be accepted, it must undergo a two-step verification process:
            </p>
            <ul>
                <li>
                    <strong>Seller Approval:</strong> The Seller must first review the images and details of the return request to verify the claim.
                </li>
                <li>
                    <strong>Admin Finalization:</strong> Once the Seller approves, the Core2Cover Admin team performs a final check to ensure all platform policies are met.
                </li>
            </ul>
            <p>
                A refund will be initiated ONLY after both the Seller and the Admin have approved the request. If either party rejects the request based on the evidence provided, the return will not be accepted.
            </p>

            <h3>4. Refund Timeline</h3>
            <p>
                Once the Seller approves the return, the refund will be processed to your original payment method within 7-10 working days.
            </p>
        </LegalLayout>
    );
}