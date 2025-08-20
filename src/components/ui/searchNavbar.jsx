"use client";
import { useState, useEffect } from "react";

const SearchNavbar = () => {
    const [query, setQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // only render input after client mount
    }, []);

    if (!mounted) return null;

    return (
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-[500px] max-w-[600px] max-h-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
    );
};

export default SearchNavbar;
