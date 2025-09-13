"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Minimal shadcn-like pagination UI
const Pagination = ({ pagination }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = pagination?.currentPage || 1;
    const totalPages = pagination?.totalPages || 1;

    const createHref = (page) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) params.delete('page'); else params.set('page', String(page));
        return `${pathname}?${params.toString()}`;
    };

    const goTo = (page) => {
        router.replace(createHref(page), { scroll: false });
    };

    const windowPages = useMemo(() => {
        const pages = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + 4);
        for (let p = start; p <= end; p++) pages.push(p);
        return pages;
    }, [currentPage, totalPages]);

    // Always show pagination bar, even if only one page

    return (
        <nav className="flex items-center justify-center gap-2 mt-6" aria-label="pagination">
            {/* Prev */}
            <button
                onClick={() => goTo(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="h-9 px-3 inline-flex items-center rounded-md border bg-white text-sm disabled:opacity-50"
            >
                Previous
            </button>

            {/* Page numbers */}
            <ul className="flex items-center gap-1">
                {(windowPages.length ? windowPages : [1]).map((p) => (
                    <li key={p}>
                        <button
                            onClick={() => goTo(p)}
                            className={`h-9 w-9 inline-flex items-center justify-center rounded-md border text-sm ${p === currentPage ? 'bg-black text-white' : 'bg-white'}`}
                            aria-current={p === currentPage ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Next */}
            <button
                onClick={() => goTo(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="h-9 px-3 inline-flex items-center rounded-md border bg-white text-sm disabled:opacity-50"
            >
                Next
            </button>
        </nav>
    );
};

export default Pagination;


