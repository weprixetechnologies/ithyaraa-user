import FaqAccordion from "@/components/faq/FaqAccordion";
import FaqContactBlock from "@/components/faq/FaqContactBlock";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.ithyaraa.com/api";
const REVALIDATE = 86400; // 24 hours ISR

async function getFaqs() {
    try {
        const res = await fetch(`${API_BASE}/public/faqs`, {
            next: { revalidate: REVALIDATE },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export const metadata = {
    title: "FAQ | Frequently Asked Questions",
    description: "Frequently asked questions and answers. Get in touch if you need more help.",
};

export default async function FaqPage() {
    const faqs = await getFaqs();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer_html?.replace(/<[^>]+>/g, " ") || "",
            },
        })),
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] relative overflow-hidden">
            {/* Subtle dashed decorative pattern - top right */}
            <div
                className="absolute top-0 right-0 w-64 h-64 border border-dashed border-gray-200/60 rounded-full -translate-y-1/2 translate-x-1/2"
                aria-hidden
            />
            {/* Subtle dashed decorative pattern - bottom left */}
            <div
                className="absolute bottom-0 left-0 w-96 h-96 border border-dashed border-gray-200/60 rounded-full translate-y-1/2 -translate-x-1/2"
                aria-hidden
            />

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <header className="text-center mb-10">
                    <h1 className="text-3xl sm:text-6xl font-bold text-gray-800 mb-4">
                        Frequently asked{" "}
                        <span className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-800 bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h1>
                    <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto">
                        Do you need some help with something or do you have questions on some features?
                    </p>
                </header>

                <FaqAccordion items={faqs} />

                <FaqContactBlock email={process.env.NEXT_PUBLIC_CONTACT_EMAIL} />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </div>
    );
}
