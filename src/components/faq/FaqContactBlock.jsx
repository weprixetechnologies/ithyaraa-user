"use client";

import { useState } from "react";

export default function FaqContactBlock({ email }) {
    const [copied, setCopied] = useState(false);
    const displayEmail = email || "info@ithyaraa.com";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayEmail);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    }

    return (
        <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Have any other questions?
            </h2>
            <p className="text-gray-500 text-sm mb-4">
                Don&apos;t hesitate to send us an email with your enquiry or statement at:
            </p>
            <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <span className="px-4 py-3 text-gray-800 font-medium text-sm">
                    {displayEmail}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    aria-label="Copy email"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied && <span className="sr-only">Copied</span>}
                </button>
            </div>
            {copied && (
                <p className="text-sm text-green-600 mt-2">Copied to clipboard</p>
            )}
        </div>
    );
}
