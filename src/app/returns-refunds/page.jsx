import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Returns & Refunds | ITHYARAA",
  description:
    "ITHYARAA returns and refunds policy. Eligibility, processing times, non-returnable items, and how to request a return or exchange.",
  openGraph: {
    title: "Returns & Refunds | ITHYARAA",
    description:
      "ITHYARAA returns and refunds policy. Eligibility, processing, and how to request a return or exchange.",
    type: "website",
  },
};

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "eligibility", label: "Return Eligibility" },
  { id: "non-returnable", label: "Non-Returnable Items" },
  { id: "refund-processing", label: "Refund Processing" },
  { id: "late-missing", label: "Late or Missing Refunds" },
  { id: "exchanges", label: "Exchanges" },
  { id: "shipping-handling", label: "Shipping & Handling" },
  { id: "contact", label: "Contact Us" },
];

export default function ReturnsRefundsPage() {
  return (
    <LegalLayout
      title="Returns & Refunds"
      lastUpdated="May 23rd, 2022"
      introContent={
        <>
          <p className="text-base font-semibold text-gray-900 mb-3">
            We want you to be satisfied with your purchase. This policy
            explains how returns and refunds work at ITHYARAA.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Please read the following sections to understand eligibility,
            timeframes, and how to initiate a return or request a refund. If
            you have any questions, contact our Customer Care team.
          </p>
        </>
      }
      tocItems={TOC_ITEMS}
    >
      <div className="space-y-8 lg:space-y-10">
        <section id="overview" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">1. Overview</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Our Returns & Refunds policy applies to purchases made through
            ITHYARAA. We accept returns and process refunds in accordance with
            the terms below. By placing an order, you agree to this policy.
          </p>
        </section>

        <section id="eligibility" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            2. Return Eligibility
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            To be eligible for a return, items must typically be unused, in
            original packaging, and returned within 30 days of delivery. You
            may need to provide proof of purchase. Some product categories have
            different return windows; check the product page or order
            confirmation for details.
          </p>
          <ol className="list-decimal list-inside text-gray-700 text-[15px] space-y-1 ml-2">
            <li>Item must be in resalable condition</li>
            <li>Original tags and packaging should be intact where applicable</li>
            <li>Return must be initiated within the stated return window</li>
          </ol>
        </section>

        <section id="non-returnable" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            3. Non-Returnable Items
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            The following are generally not eligible for return unless
            required by law or otherwise stated:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-[15px] space-y-1 ml-2">
            <li>Personal care and hygiene products (e.g., certain cosmetics)</li>
            <li>Perishable or consumable goods</li>
            <li>Items marked as final sale</li>
            <li>Custom or personalized products</li>
            <li>Gift cards and digital content</li>
          </ul>
        </section>

        <section id="refund-processing" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            4. Refund Processing
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            Once we receive and inspect your return, we will notify you of the
            approval or rejection of your refund. If approved, refunds will be
            credited to your original method of payment within a specified
            number of business days, depending on your bank or card issuer.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Refunds do not include original shipping charges unless the return
            is due to our error or a defective product.
          </p>
        </section>

        <section id="late-missing" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            5. Late or Missing Refunds
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            If you have not received your refund within the expected
            timeframe, first check your bank account and contact your card
            issuer. If you have done this and still have not received your
            refund, please contact us at support@ithyaraa.com with your order
            number and we will assist you.
          </p>
        </section>

        <section id="exchanges" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">6. Exchanges</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            If you need to exchange an item for a different size, color, or
            product, please initiate a return and place a new order for the
            desired item, or contact Customer Care to see if an exchange can be
            arranged. Exchanges are subject to the same eligibility and
            condition requirements as returns.
          </p>
        </section>

        <section id="shipping-handling" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            7. Shipping & Handling
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            You are responsible for the cost of return shipping unless
            otherwise stated (e.g., prepaid label for defective items). We
            recommend using a trackable shipping service and retaining proof of
            postage. We are not responsible for items lost or damaged in
            transit during return shipment.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">8. Contact Us</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            For return requests, refund inquiries, or questions about this
            policy, contact us at support@ithyaraa.com or through the Customer
            Care section on our website. Please include your order number and
            a brief description of your request.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
