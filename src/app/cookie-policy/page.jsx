import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Cookie Policy | ITHYARAA",
  description:
    "How ITHYARAA uses cookies and similar technologies. Types of cookies, third-party cookies, and how to manage your preferences.",
  openGraph: {
    title: "Cookie Policy | ITHYARAA",
    description:
      "How ITHYARAA uses cookies and similar technologies. Manage your preferences.",
    type: "website",
  },
};

const TOC_ITEMS = [
  { id: "what-are-cookies", label: "What Are Cookies" },
  { id: "how-we-use", label: "How We Use Cookies" },
  { id: "types", label: "Types of Cookies" },
  { id: "third-party", label: "Third-Party Cookies" },
  { id: "managing-preferences", label: "Managing Preferences" },
  { id: "policy-updates", label: "Policy Updates" },
  { id: "contact", label: "Contact Us" },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="May 23rd, 2022"
      introContent={
        <>
          <p className="text-base font-semibold text-gray-900 mb-3">
            This Cookie Policy explains how ITHYARAA uses cookies and similar
            technologies when you visit our website.
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            By continuing to use our site, you consent to our use of cookies
            as described in this policy. You can change your preferences at
            any time through your browser or the options we provide.
          </p>
        </>
      }
      tocItems={TOC_ITEMS}
    >
      <div className="space-y-8 lg:space-y-10">
        <section id="what-are-cookies" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            1. What Are Cookies
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            Cookies are small text files that are stored on your device (computer,
            tablet, or mobile) when you visit a website. They are widely used to
            make websites work more efficiently, remember your preferences, and
            provide information to site owners. Cookies can be &quot;first-party&quot;
            (set by us) or &quot;third-party&quot; (set by other services we use).
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We also use similar technologies such as local storage, session
            storage, and pixel tags where relevant; when we refer to
            &quot;cookies&quot; in this policy, we may include these where
            appropriate.
          </p>
        </section>

        <section id="how-we-use" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            2. How We Use Cookies
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We use cookies to: keep you signed in; remember your preferences
            (e.g., language, region); understand how you use our site so we can
            improve it; deliver relevant content and ads; and help prevent
            fraud and ensure security. The specific cookies we use and their
            purposes are described in the sections below.
          </p>
        </section>

        <section id="types" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">3. Types of Cookies</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            We use the following types of cookies:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-[15px] space-y-1 ml-2">
            <li>
              <strong>Strictly necessary:</strong> Required for the website to
              function (e.g., authentication, security, load balancing).
            </li>
            <li>
              <strong>Functional:</strong> Remember your choices and preferences
              to improve your experience.
            </li>
            <li>
              <strong>Analytics:</strong> Help us understand how visitors use
              our site (e.g., pages visited, time on site).
            </li>
            <li>
              <strong>Marketing:</strong> Used to deliver relevant advertisements
              and measure campaign effectiveness (where you have consented).
            </li>
          </ul>
        </section>

        <section id="third-party" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            4. Third-Party Cookies
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            Third-party services we use (such as analytics providers, payment
            processors, and advertising partners) may set their own cookies when
            you use our site. These are subject to the respective third
            party&apos;s privacy and cookie policies. We do not control these
            cookies; you can often manage them through your browser settings or
            the third party&apos;s opt-out tools.
          </p>
        </section>

        <section id="managing-preferences" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            5. Managing Preferences
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            You can control and delete cookies through your browser settings.
            Most browsers allow you to refuse or accept cookies, or to delete
            existing cookies. Blocking or deleting cookies may affect the
            functionality of our website (for example, you may need to sign in
            again or certain features may not work as intended).
          </p>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            For more information on managing cookies, see your browser&apos;s
            help section or visit www.aboutcookies.org. Where we offer a
            cookie preference center, you can also manage your choices there.
          </p>
        </section>

        <section id="policy-updates" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">
            6. Policy Updates
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            We may update this Cookie Policy from time to time to reflect
            changes in our practices, technology, or legal requirements. The
            &quot;Last Updated&quot; date at the top of this page indicates
            when the policy was last revised. We encourage you to review this
            page periodically. Continued use of our site after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-black mb-3">7. Contact Us</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            If you have questions about our use of cookies or this Cookie
            Policy, please contact us at support@ithyaraa.com or through the
            contact information on our website.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
