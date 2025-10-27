'use client'

import React, { useState, useEffect } from 'react'
import axios from '@/lib/axiosInstance'
import Image from 'next/image'
import Link from 'next/link'

const BrandsPage = () => {
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchBrands()
    }, [])

    const fetchBrands = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/admin/brands')
            if (response.data.success) {
                setBrands(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching brands:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredBrands = brands.filter(brand =>
        brand.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                                <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-4"></div>
                                <div className="h-4 bg-gray-300 rounded mx-auto w-32 mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded mx-auto w-24"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Search Bar Section */}
            <div className="bg-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 pl-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition-all"
                        />
                        <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Brands Grid */}
            <div className="container mx-auto px-4 py-12">
                {filteredBrands.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">No brands found</h3>
                        <p className="mt-2 text-gray-600">
                            {searchQuery ? 'Try searching with different keywords' : 'No brands available at the moment'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredBrands.map((brand) => (
                            <Link
                                key={brand.uid}
                                href={`/brands/${brand.uid}`}
                                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-yellow"
                            >
                                <div className="p-6">
                                    {/* Brand Avatar */}
                                    <div className="flex flex-col items-center text-center">
                                        {brand.profilePhoto ? (
                                            <div className="relative mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Image
                                                    src={brand.profilePhoto}
                                                    alt={brand.name}
                                                    width={140}
                                                    height={140}
                                                    className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                                {brand.verifiedEmail === 1 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 border-4 border-white">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 .723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center text-4xl md:text-5xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                                                {brand.name?.charAt(0)?.toUpperCase() || 'B'}
                                            </div>
                                        )}

                                        {/* Brand Name */}
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-yellow transition-colors">
                                            {brand.name || 'Unnamed Brand'}
                                        </h3>

                                        {/* Status Badge */}
                                        {brand.verifiedEmail === 1 && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium mt-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 .723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Arrow Icon */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-6 h-6 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-yellow mb-2">{brands.length}</div>
                            <div className="text-gray-600 font-medium">Total Brands</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {brands.filter(b => b.verifiedEmail === 1).length}
                            </div>
                            <div className="text-gray-600 font-medium">Verified Brands</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                                {brands.filter(b => b.gstin).length}
                            </div>
                            <div className="text-gray-600 font-medium">GST Registered</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BrandsPage

