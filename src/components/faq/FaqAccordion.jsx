"use client";

import { useState } from "react";

/**
 * Client-only FAQ accordion: one open at a time, + / − icons, smooth animation, ARIA.
 */
export default function FaqAccordion({ items }) {
    const [openId, setOpenId] = useState(items?.length ? items[0].id : null);

    if (!items || items.length === 0) {
        return (
            <div className="rounded-2xl bg-white/80 shadow-sm border border-gray-100 p-6 text-center text-gray-500">
                No FAQs available at the moment.
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden"
            role="region"
            aria-label="Frequently asked questions"
        >
            <ul className="divide-y divide-gray-100">
                {items.map((faq) => {
                    const isOpen = openId === faq.id;
                    return (
                        <li key={faq.id} className="bg-white">
                            <button
                                type="button"
                                onClick={() => setOpenId(isOpen ? null : faq.id)}
                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-none"
                                aria-expanded={isOpen}
                                aria-controls={`faq-answer-${faq.id}`}
                                id={`faq-question-${faq.id}`}
                            >
                                <span className="font-semibold text-gray-800 text-base pr-4">
                                    {faq.question}
                                </span>
                                <span
                                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-bold text-lg leading-none select-none"
                                    aria-hidden
                                >
                                    {isOpen ? "−" : "+"}
                                </span>
                            </button>
                            <div
                                id={`faq-answer-${faq.id}`}
                                role="region"
                                aria-labelledby={`faq-question-${faq.id}`}
                                className="grid transition-[grid-template-rows] duration-300 ease-out"
                                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                            >
                                <div className="overflow-hidden min-h-0">
                                    <div
                                        className="px-6 pb-5 pt-0 text-gray-600 text-sm leading-relaxed border-t-0"
                                        dangerouslySetInnerHTML={{ __html: faq.answer_html }}
                                    />
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
