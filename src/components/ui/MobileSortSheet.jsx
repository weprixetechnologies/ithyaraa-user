"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaTimes } from "react-icons/fa";

const MobileSortSheet = ({ isOpen, onClose }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedSort = useMemo(() => {
        const sb = searchParams.get('sortBy') || 'createdAt';
        const so = (searchParams.get('sortOrder') || 'DESC').toUpperCase();
        return `${sb}-${so}`;
    }, [searchParams]);

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') params.delete(key);
            else params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const sortOptions = [
        { id: 'createdAt-DESC', label: 'Newest First' },
        { id: 'createdAt-ASC', label: 'Oldest First' },
        { id: 'salePrice-ASC', label: 'Price: Low to High' },
        { id: 'salePrice-DESC', label: 'Price: High to Low' },
        { id: 'name-ASC', label: 'Name: A to Z' },
        { id: 'name-DESC', label: 'Name: Z to A' }
    ];

    const handleSortChange = (sortId) => {
        const [sortBy, sortOrder] = sortId.split('-');
        updateParams({ sortBy, sortOrder, page: 1 });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0bg-opacity-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={onClose} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-hidden transform translate-y-0">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Sort By</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {sortOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSortChange(option.id)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedSort === option.id
                                ? 'border-primary-yellow bg-yellow-50 text-black'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{option.label}</span>
                                {selectedSort === option.id && (
                                    <div className="w-2 h-2 bg-primary-yellow rounded-full" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileSortSheet;
