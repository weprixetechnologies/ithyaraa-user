"use client";

import React, { useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const TilledMiniCategories = ({ isMobile = true, sections = [] }) => {
    const router = useRouter();

    const handleClick = useCallback((section) => {
        const baseRoute = section.routeTo || section.link || '/shop';

        const params = new URLSearchParams();
        const filters = section.filters || {};

        if (filters.type) params.append('type', filters.type);
        if (filters.categoryID) params.append('categoryID', filters.categoryID);
        if (filters.offerID) params.append('offerID', filters.offerID);
        if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
        if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const query = params.toString();
        const target = query ? `${baseRoute}?${query}` : baseRoute;

        router.push(target);
    }, [router]);

    if (!sections.length) {
        return null;
    }

    return (
        <div className={`overflow-x-auto scrollbar-hide ${isMobile ? "flex md:hidden" : "hidden md:flex"}`}>
            {sections.map((section) => (
                <button
                    key={section.id}
                    type="button"
                    onClick={() => handleClick(section)}
                    className="flex flex-col items-center p-2 focus:outline-none"
                >
                    <Image
                        src={section.image}
                        alt={section.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 min-w-20 min-h-20 object-cover mb-2 rounded-lg"
                    />
                    <p className="text-xs text-center font-medium max-w-20">
                        {section.title}
                    </p>
                </button>
            ))}
        </div>
    );
};

export default TilledMiniCategories;
