/**
 * Reusable layout for legal pages (Privacy Policy, Terms, etc.).
 * Two-column desktop layout, stacked on mobile. Print-friendly.
 *
 * i18n suggestion: Use next-intl or next-i18next with locale in the path
 * (e.g. /en/privacy-policy, /hi/privacy-policy). Store legal copy in JSON
 * or MD per locale and pass title, lastUpdated, tocItems, and section content
 * from the page so this layout stays layout-only. Generate metadata per locale.
 */
export default function LegalLayout({ title, lastUpdated, introContent, tocItems, children }) {
  return (
    <article
      id="top"
      className="legal-page bg-white text-gray-900 min-h-screen"
      aria-label={title}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <header className="text-center mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">
            {title}
          </h1>
          <p className="text-sm text-gray-500" aria-label="Last updated date">
            Last Updated {lastUpdated}
          </p>
        </header>

        {/* Intro */}
        {introContent && (
          <div className="mb-8 lg:mb-10 max-w-3xl">
            {introContent}
          </div>
        )}

        {/* Two-column content area */}
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16">
          {/* Left: Main content */}
          <div className="flex-1 min-w-0 lg:max-w-[65%]">
            {children}
          </div>

          {/* Right: Sticky TOC */}
          <nav
            className="lg:w-72 flex-shrink-0 order-first lg:order-last mb-8 lg:mb-0"
            aria-label="Table of contents"
          >
            <div className="lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-black mb-4">
                Table of contents
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-4">
                <a
                  href="#top"
                  className="text-blue-600 underline text-sm hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Back to top ↑
                </a>
              </p>
            </div>
          </nav>
        </div>
      </div>
    </article>
  );
}
