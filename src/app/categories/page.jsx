"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTag, FaShoppingBag, FaArrowRight, FaSearch } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import Loading from '@/components/ui/loading';
import CategoriesLoading from '@/components/categories/CategoriesLoading';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        filterCategories();
    }, [categories, searchTerm]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/categories/public');

            if (response.data.success) {
                setCategories(response.data.data || []);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterCategories = () => {
        if (!searchTerm.trim()) {
            setFilteredCategories(categories);
        } else {
            const filtered = categories.filter(category =>
                category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.slug.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCategories(filtered);
        }
    };

    const handleCategoryClick = (categoryID) => {
        router.push(`/shop?categoryID=${categoryID}`);
    };

    const getCategoryImage = (category) => {
        if (category.categoryBanner && category.categoryBanner !== 'https://ithyaraa.b-cdn.net/ithyaraa-logo.png') {
            return category.categoryBanner;
        }
        if (category.featuredImage && category.featuredImage !== 'https://ithyaraa.b-cdn.net/ithyaraa-logo.png') {
            return category.featuredImage;
        }
        return null;
    };

    if (loading) {
        return <CategoriesLoading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">{error}</div>
                        <button
                            onClick={fetchCategories}
                            className="bg-primary-yellow text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            {/* <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <IoIosArrowBack size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                            <p className="text-gray-600">Browse products by category</p>
                        </div>
                    </div>
                </div>
            </div> */}

            <div className="container mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-full mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
                    </p>
                </div>

                {/* Categories Grid */}
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <FaTag size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'Try adjusting your search terms' : 'No categories available at the moment'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => (
                            <div
                                key={category.categoryID}
                                onClick={() => handleCategoryClick(category.categoryID)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                            >
                                {/* Category Image */}
                                <div className="relative h-48 overflow-hidden">
                                    {getCategoryImage(category) ? (
                                        <Image
                                            src={getCategoryImage(category)}
                                            alt={category.categoryName}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-yellow to-orange-400 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <FaShoppingBag size={32} />
                                                <p className="text-sm font-medium mt-2">{category.categoryName}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800 border border-gray-200">
                                            <FaTag size={12} />
                                            Category
                                        </span>
                                    </div>
                                </div>

                                {/* Category Content */}
                                <div className="p-6">
                                    {/* Category Name */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                        {category.categoryName}
                                    </h3>

                                    {/* Category Slug */}
                                    <p className="text-sm text-gray-500 mb-4 capitalize">
                                        {category.slug.replace(/_/g, ' ')}
                                    </p>

                                    {/* Action Button */}
                                    <div className="w-full bg-primary-yellow text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 group">
                                        View Products
                                        <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                {filteredCategories.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-primary-yellow to-yellow-400 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Can't Find What You're Looking For?
                            </h3>
                            <p className="text-gray-800 mb-6">
                                Browse all our products and discover amazing deals
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                <FaShoppingBag size={16} />
                                Browse All Products
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
