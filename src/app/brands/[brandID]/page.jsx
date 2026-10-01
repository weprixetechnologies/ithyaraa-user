'use client'

import React, { useState, useEffect, useCallback } from 'react'
import axios from '@/lib/axiosInstance'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ShopProductCard from '@/components/ui/ShopProductCard'
import { FaCaretLeft } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

const PRODUCTS_PER_PAGE = 20

const BrandProductsPage = () => {
    const router = useRouter()
    const params = useParams()
    const brandID = params.brandID

    const [brand, setBrand] = useState(null)
    const [products, setProducts] = useState([])
    const [totalProducts, setTotalProducts] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [page, setPage] = useState(1)
    const [productsLoading, setProductsLoading] = useState(false)
    const [brandLoading, setBrandLoading] = useState(true)
    const [reviewsSummary, setReviewsSummary] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Fetch brand details + reviews once
    useEffect(() => {
        if (!brandID) return
        const fetchBrand = async () => {
            try {
                setBrandLoading(true)
                const [brandRes, reviewsRes] = await Promise.all([
                    axios.get(`/admin/brands/${brandID}`),
                    axios.get(`/admin/brands/${brandID}/reviews/stats`)
                ])
                if (brandRes.data.success) setBrand(brandRes.data.data)
                if (reviewsRes.data.success) setReviewsSummary(reviewsRes.data.data)
            } catch (err) {
                console.error('Error fetching brand:', err)
            } finally {
                setBrandLoading(false)
            }
        }
        fetchBrand()
    }, [brandID])

    // Fetch products whenever page or search changes
    const fetchProducts = useCallback(async () => {
        if (!brandID) return
        try {
            setProductsLoading(true)
            const params = new URLSearchParams({
                brandID,
                page,
                limit: PRODUCTS_PER_PAGE,
            })
            if (debouncedSearch) params.append('name', debouncedSearch)

            const res = await axios.get(`/products/all-products?${params.toString()}`)
            if (res.data.success) {
                setProducts(res.data.data || [])

                // Support both total/totalItems/count from backend
                const total = res.data.total ?? res.data.totalItems ?? res.data.count ?? 0
                setTotalProducts(total)
                setTotalPages(Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)))
            }
        } catch (err) {
            console.error('Error fetching products:', err)
        } finally {
            setProductsLoading(false)
        }
    }, [brandID, page, debouncedSearch])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [page])

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return
        setPage(newPage)
    }

    const renderPageNumbers = () => {
        const buttons = []
        const maxVisible = 5
        let start = Math.max(1, page - 2)
        let end = Math.min(totalPages, start + maxVisible - 1)
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)

        for (let i = start; i <= end; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-150 ${
                        page === i
                            ? 'bg-[#fb4a6f] text-white shadow-md shadow-pink-200 scale-110'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#fb4a6f] hover:text-[#fb4a6f]'
                    }`}
                >
                    {i}
                </button>
            )
        }
        return buttons
    }

    if (brandLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-64 bg-gray-300 rounded-xl mb-8"></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-72"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!brand) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h2>
                    <Link href="/brands" className="text-primary-yellow hover:underline">
                        ← Back to Brands
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Brand Header */}
            <div className="w-full px-4 py-6 flex justify-center">
                <div className="w-full max-w-7xl">
                    <div className="bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200 shadow-lg py-6 px-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                        {/* Left Section */}
                        <div className="flex items-center gap-4 flex-1">
                            <div className="h-full flex items-start justify-center">
                                <button
                                    onClick={() => router.push('/brands')}
                                    className="cursor-pointer p-2 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                >
                                    <FaCaretLeft className="text-2xl text-gray-600" />
                                </button>
                            </div>
                            <div className="relative">
                                <Image
                                    src={brand.profilePhoto || '/default-avatar.png'}
                                    alt={brand.name}
                                    width={120}
                                    height={120}
                                    className="rounded-full w-28 h-28 md:w-32 md:h-32 object-cover border-4 border-white shadow-xl"
                                />
                                {brand.verifiedEmail === 1 && (
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border-4 border-white">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{brand.name}</h1>
                                    {brand.verifiedEmail === 1 && (
                                        <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-lg">@{brand.username}</p>
                                {brand.gstin && (
                                    <div className="flex items-center gap-1 text-sm text-gray-700">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-medium">GSTIN: {brand.gstin}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Section - Reviews */}
                        <div className="flex items-center gap-6">
                            {/* Total products badge */}
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-100 px-6 py-4 rounded-xl shadow-md text-center">
                                <span className="text-3xl font-bold text-gray-900">{totalProducts}</span>
                                <div className="text-sm text-gray-500 font-medium mt-1">Products</div>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 px-6 py-4 rounded-xl shadow-md">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.174 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.95-.69l1.286-3.957z" />
                                        </svg>
                                        <span className="text-3xl font-bold text-gray-900">
                                            {reviewsSummary?.avgStars?.toFixed(1) || '0.0'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium text-center">
                                        {reviewsSummary?.totalReviews || 0} {reviewsSummary?.totalReviews === 1 ? 'Review' : 'Reviews'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="container mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-8 max-w-full mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 pl-14 pr-12 bg-white border-2 border-gray-200 rounded-xl shadow-md focus:outline-none focus:border-[#fb4a6f] focus:ring-2 focus:ring-[#fb4a6f]/20 transition-all text-gray-900 placeholder-gray-400"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                {productsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm h-72 animate-pulse" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="mt-4 text-2xl font-semibold text-gray-900">No Products Found</h3>
                        <p className="mt-2 text-gray-600">
                            {searchQuery ? `No results for "${searchQuery}".` : "This brand doesn't have any products yet."}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-5 py-2 bg-[#fb4a6f] text-white rounded-lg text-sm font-medium hover:bg-[#e03d60] transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                        <Link
                            href="/brands"
                            className="mt-6 inline-block px-6 py-3 bg-primary-yellow text-white rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                            Explore Other Brands
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Result summary */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-500">
                                Showing{' '}
                                <span className="font-semibold text-gray-800">
                                    {(page - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(page * PRODUCTS_PER_PAGE, totalProducts)}
                                </span>{' '}
                                of <span className="font-semibold text-gray-800">{totalProducts}</span> products
                                {searchQuery && <span className="text-[#fb4a6f]"> for "{searchQuery}"</span>}
                            </p>
                            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ShopProductCard key={product.productID} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {/* Previous */}
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-semibold hover:border-[#fb4a6f] hover:text-[#fb4a6f] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Prev
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex items-center gap-1.5">
                                        {page > 3 && (
                                            <>
                                                <button
                                                    onClick={() => handlePageChange(1)}
                                                    className="w-9 h-9 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:border-[#fb4a6f] hover:text-[#fb4a6f] transition-all"
                                                >
                                                    1
                                                </button>
                                                <span className="text-gray-400 text-sm px-1">…</span>
                                            </>
                                        )}
                                        {renderPageNumbers()}
                                        {page < totalPages - 2 && (
                                            <>
                                                <span className="text-gray-400 text-sm px-1">…</span>
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className="w-9 h-9 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:border-[#fb4a6f] hover:text-[#fb4a6f] transition-all"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Next */}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-semibold hover:border-[#fb4a6f] hover:text-[#fb4a6f] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default BrandProductsPage
