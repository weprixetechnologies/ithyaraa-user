import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Terms & Conditions | ITHYARAA",
  description:
    "ITHYARAA terms and conditions of use. Acceptance of terms, use of services, payments, intellectual property, and liability.",
  openGraph: {
    title: "Terms & Conditions | ITHYARAA",
    description:
      "ITHYARAA terms and conditions of use. Read our terms of service.",
    type: "website",
  },
};

const TOC_ITEMS = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "use-of-services", label: "Use of Services" },
  { id: "user-accounts", label: "User Accounts" },
  { id: "payments-billing", label: "Payments & Billing" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "prohibited", label: "Prohibited Activities" },
  { id: "limitation-liability", label: "Limitation of Liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      lastUpdated="May 23rd, 2022"
      introContent={
        <>
          <p className="text-base font-semibold text-gray-900 mb-3">
            Please read these Terms and Conditions carefully before using
            ITHYARAA&apos;s website and services.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            By accessing or using our services, you agree to be bound by these
            terms. If you do not agree, please do not use our services. We
            reserve the right to update these terms; continued use after
            changes constitutes acceptance.
          </p>
        </>
      }
      tocItems={TOC_ITEMS}
    >
      <div className="space-y-8 lg:space-y-10">
        <section id="acceptance" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            By accessing or using the ITHYARAA website, mobile applications,
            or any related services, you agree to comply with and be bound by
            these Terms and Conditions and our Privacy Policy. If you are using
            our services on behalf of an organization, you represent that you
            have authority to bind that organization to these terms.
          </p>
        </section>

        <section id="use-of-services" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            2. Use of Services
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            You may use our services only for lawful purposes and in
            accordance with these terms. You agree not to use the services in
            any way that could damage, disable, or overburden our systems or
            interfere with any other party&apos;s use of the services.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We grant you a limited, non-exclusive, non-transferable license to
            access and use our services for personal, non-commercial use,
            subject to these terms.
          </p>
        </section>

        <section id="user-accounts" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">3. User Accounts</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            You may need to create an account to access certain features. You are
            responsible for maintaining the confidentiality of your account
            credentials and for all activities that occur under your account.
            You must provide accurate and complete information and notify us
            immediately of any unauthorized use.
          </p>
        </section>

        <section id="payments-billing" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            4. Payments & Billing
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            All fees and charges are as displayed at checkout. You agree to
            pay all amounts due using a valid payment method. We may use
            third-party payment processors; your use of payment features is
            subject to their terms as well. Prices are subject to change
            without notice; orders are charged at the price in effect at the
            time of purchase. Refunds are governed by our Returns & Refunds
            policy.
          </p>
        </section>

        <section id="intellectual-property" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            5. Intellectual Property
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            All content on our services, including text, graphics, logos,
            images, and software, is the property of ITHYARAA or its licensors
            and is protected by copyright and other intellectual property
            laws. You may not copy, modify, distribute, or create derivative
            works without our prior written consent. Trademarks and trade
            names used on the site are the property of their respective
            owners.
          </p>
        </section>

        <section id="prohibited" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            6. Prohibited Activities
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            You may not: use the services for any illegal purpose; attempt to
            gain unauthorized access to our systems or other accounts; transmit
            viruses or malicious code; scrape or harvest data without
            permission; impersonate another person or entity; or use the
            services in any manner that could harm us or other users.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We reserve the right to suspend or terminate access for violation
            of these terms.
          </p>
        </section>

        <section id="limitation-liability" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            To the maximum extent permitted by law, ITHYARAA and its
            affiliates shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, or any loss of profits,
            data, or goodwill, arising from your use of the services. Our total
            liability for any claim shall not exceed the amount you paid to us
            in the twelve months preceding the claim. Some jurisdictions do not
            allow certain limitations; in such cases, our liability is limited
            to the fullest extent permitted by law.
          </p>
        </section>

        <section id="termination" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">8. Termination</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We may suspend or terminate your access to the services at any
            time, with or without cause or notice. You may stop using the
            services at any time. Upon termination, your right to use the
            services ceases immediately. Provisions that by their nature
            should survive (including intellectual property, limitation of
            liability, and governing law) will survive termination.
          </p>
        </section>

        <section id="governing-law" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">9. Governing Law</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            These terms are governed by the laws of India, without regard to
            conflict of law principles. Any dispute arising from these terms or
            the services shall be subject to the exclusive jurisdiction of the
            courts in the location specified by ITHYARAA.
          </p>
        </section>

        <section id="changes" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            10. Changes to Terms
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We may modify these terms at any time. We will post the updated
            terms on this page and update the &quot;Last Updated&quot; date.
            Your continued use of the services after changes constitutes
            acceptance. If you do not agree to the new terms, you must stop
            using the services.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">11. Contact Us</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            For questions about these Terms and Conditions, please contact us
            at support@ithyaraa.com or through the contact information
            provided on our website.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
