"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PrebookingProductCardMap from '../ui/prebookingProductCardMap'

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
        <div>
            <div className="flex flex-row justify-between px-5 mt-5 items-end mb-3 md:flex-col md:items-center">
                <div className="flex flex-col">
                    <p className="text-lg font-medium md:text-2xl">{heading}</p>
                    <p className="text-xs font-semibold text-secondary-text-deep md:text-center md:text-sm">{subHeading}</p>
                </div>
                <button className="bg-primary-yellow h-[30px] px-2 text-xs font-medium rounded md:hidden">
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
        </div>
    )
}

export default PresaleSection
