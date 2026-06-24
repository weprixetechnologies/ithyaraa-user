"use client"
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import PrebookingProductCardMap from '../ui/prebookingProductCardMap'

const AnimatedBlobs = dynamic(() => import('./AnimatedBlobs'), { ssr: false })

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.ithyaraa.com/api'

const defaultPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
    hasNextPage: false,
    hasPreviousPage: false
}

const PresaleSection = ({ heading, subHeading, initialProducts = [], initialPagination = null }) => {
    const [products, setProducts] = useState(initialProducts)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState(initialPagination || defaultPagination)

    useEffect(() => {
        if (currentPage === 1) return
        const fetchMore = async () => {
            try {
                setLoadingMore(true)
                setError(null)
                const response = await axios.get(`${API_BASE}/presale/products/paginated`, {
                    params: { page: currentPage, limit: 5 }
                })
                if (response.data?.success) {
                    setProducts(prev => [...prev, ...(response.data.data || [])])
                    if (response.data.pagination) setPagination(response.data.pagination)
                } else {
                    setError('Failed to fetch products')
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch presale products')
            } finally {
                setLoadingMore(false)
            }
        }
        fetchMore()
    }, [currentPage])

    return (
        <section className="relative overflow-hidden w-full">
            <AnimatedBlobs />
            <div className="flex flex-col items-center justify-center max-w-[900px] mx-auto py-8 md:py-12 px-4 text-center animate-editorial-fade">
                {/* Eyebrow Label */}
                <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-[#ff7aa2] text-[16px] md:text-[18px]">✦</span>
                    <span className="font-parisienne text-[#ff7aa2] text-[16px] md:text-[18px] font-normal leading-none pt-1">
                        Trending Now
                    </span>
                    <span className="text-[#ff7aa2] text-[16px] md:text-[18px]">✦</span>
                </div>
                
                {/* Main Title */}
                <h2 className="font-playfair font-medium text-[36px] md:text-[3rem] leading-[1] tracking-[-0.03em] text-[#111111] mb-[10px]">
                    {heading}
                </h2>
                
                {/* Subtitle */}
                {subHeading && (
                    <p className="font-medium text-[16px] md:text-[18px] lg:text-[20px] leading-[1.5] text-black max-w-[700px] mx-auto">
                        {subHeading}
                    </p>
                )}
                
                <button className="mt-6 bg-primary-yellow h-[30px] px-4 text-xs font-medium rounded md:hidden">
                    Shop Now
                </button>
            </div>
            <div className="py-5">
                <div className="grid gap-10 items-center md:px-10 px-5">
                    {/* <div className="col-span-1 h-[400px] bg-gray-200 rounded-r-lg w-full"></div> */}
                    <div className=" flex">
                        {loading ? (
                            <div className="flex items-center justify-center p-4 w-full">
                                <p>Loading products...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center md:p-4 w-full">
                                <p className="text-red-500">Error: {error}</p>
                            </div>
                        ) : (
                            <PrebookingProductCardMap
                                products={products}
                                pagination={pagination}
                                onLoadMore={() => {
                                    if (pagination.hasNextPage && !loadingMore) {
                                        setCurrentPage(prev => prev + 1)
                                    }
                                }}
                                loadingMore={loadingMore}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PresaleSection
