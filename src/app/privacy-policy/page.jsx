import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Privacy Policy | ITHYARAA",
  description:
    "Learn how ITHYARAA collects, uses, and protects your personal information. Read our privacy policy for details on data handling and your rights.",
  openGraph: {
    title: "Privacy Policy | ITHYARAA",
    description:
      "Learn how ITHYARAA collects, uses, and protects your personal information.",
    type: "website",
  },
};

const TOC_ITEMS = [
  { id: "personal-information", label: "What Personal Information We Collect" },
  { id: "how-we-use", label: "How We Use Information" },
  { id: "when-we-share", label: "When We Share Information" },
  { id: "cookies-tracking", label: "Cookies & Tracking Technologies" },
  { id: "security", label: "Security" },
  { id: "international-transfers", label: "International Data Transfers" },
  { id: "third-party-links", label: "Third-Party Links" },
  { id: "your-choices", label: "Your Choices" },
  { id: "accessing-correcting", label: "Accessing & Correcting Information" },
  { id: "children", label: "Children" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="May 23rd, 2022"
      introContent={
        <>
          <p className="text-base font-semibold text-gray-900 mb-3">
            This Privacy Policy will help you better understand how we collect,
            use, and share your personal information.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            This Privacy Policy describes how ITHYARAA and its affiliates
            (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collect, use,
            disclose, and protect your personal information when you use our
            website, mobile applications, and services. It also covers
            information related to transactions, accounts, and digital assets
            where applicable.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            By using our services, you consent to the practices described in
            this policy. We may update this policy from time to time; the
            &quot;Last Updated&quot; date at the top indicates when changes were
            last made.
          </p>
        </>
      }
      tocItems={TOC_ITEMS}
    >
      <div className="space-y-8 lg:space-y-10">
        <section id="personal-information" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            1. What Personal Information We Collect
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            We may collect information you provide directly, such as name,
            email address, shipping and billing address, phone number, and
            payment details. We also collect technical data including IP
            address, device type, browser information, and usage data when you
            interact with our site or app.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-[15px] space-y-1 ml-2">
            <li>Account and profile information</li>
            <li>Order and transaction history</li>
            <li>Communications and support tickets</li>
            <li>Preferences and marketing choices</li>
          </ul>
        </section>

        <section id="how-we-use" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            2. How We Use Information
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            We use the information we collect to provide, maintain, and
            improve our services; process orders and payments; send order
            confirmations and updates; respond to your requests; and send
            promotional communications where you have opted in.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We may also use data for analytics, fraud prevention, and to comply
            with legal obligations.
          </p>
        </section>

        <section id="when-we-share" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            3. When We Share Information
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            We do not sell your personal information. We may share information
            with service providers who assist in operations (e.g., payment
            processors, shipping carriers), with legal authorities when
            required by law, or in connection with a merger or sale of assets,
            subject to applicable notice and consent requirements.
          </p>
        </section>

        <section id="cookies-tracking" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            4. Cookies & Tracking Technologies
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            We use cookies and similar technologies to remember preferences,
            analyze traffic, and personalize content. You can manage cookie
            settings in your browser. For more details, see our Cookie Policy.
          </p>
        </section>

        <section id="security" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">5. Security</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We implement technical and organizational measures to protect your
            personal information against unauthorized access, alteration,
            disclosure, or destruction. No method of transmission over the
            Internet is completely secure; we encourage you to use strong
            passwords and keep your account details confidential.
          </p>
        </section>

        <section id="international-transfers" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            6. International Data Transfers
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Your information may be transferred to and processed in countries
            other than your country of residence. We ensure appropriate
            safeguards are in place where required by applicable law.
          </p>
        </section>

        <section id="third-party-links" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            7. Third-Party Links
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Our services may contain links to third-party websites or
            services. We are not responsible for their privacy practices. We
            encourage you to read their privacy policies before providing any
            personal information.
          </p>
        </section>

        <section id="your-choices" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">8. Your Choices</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            You may opt out of marketing emails at any time via the unsubscribe
            link in our emails or through your account settings. You can also
            manage cookies through your browser and, where applicable, request
            access to or deletion of your personal data.
          </p>
        </section>

        <section id="accessing-correcting" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            9. Accessing & Correcting Information
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            You may request access to or correction of your personal
            information by contacting us. We will respond in accordance with
            applicable law. You may also update your account details in your
            profile settings.
          </p>
        </section>

        <section id="children" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">10. Children</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Our services are not directed to individuals under the age of 18.
            We do not knowingly collect personal information from children. If
            you believe we have collected such information, please contact us
            and we will take steps to delete it.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">11. Contact Us</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            If you have questions about this Privacy Policy or our data
            practices, please contact us at support@ithyaraa.com or at the
            address provided on our website. We will respond to your request
            as required by applicable law.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
