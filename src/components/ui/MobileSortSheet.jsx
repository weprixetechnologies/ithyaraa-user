"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MobileSortSheet = ({ isOpen, onClose }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedSort = useMemo(() => {
        const sb = searchParams.get('sortBy') || 'displayOrder';
        const so = (searchParams.get('sortOrder') || 'ASC').toUpperCase();
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
        { id: 'displayOrder-ASC', label: 'Featured / Recommended' },
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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60"
                        onClick={onClose}
                    />

                    {/* Sheet with 60FPS drag gesture */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 400) {
                                onClose();
                            }
                        }}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden will-change-transform"
                    >
                        {/* Drag Handle Indicator */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Sort By</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                aria-label="Close"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>
                        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto overscroll-contain">
                            {sortOptions.map((option) => {
                                const isSelected = selectedSort === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSortChange(option.id)}
                                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${isSelected
                                            ? 'border-black bg-gray-50 text-black font-semibold'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">{option.label}</span>
                                            {isSelected && (
                                                <div className="w-2.5 h-2.5 bg-black rounded-full" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MobileSortSheet;
