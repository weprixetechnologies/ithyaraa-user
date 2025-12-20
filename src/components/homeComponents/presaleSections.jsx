"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PrebookingProductCardMap from '../ui/prebookingProductCardMap'

const PresaleSection = ({ heading, subHeading }) => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 5,
        hasNextPage: false,
        hasPreviousPage: false
    })

    useEffect(() => {
        const fetchPresaleProducts = async () => {
            try {
                // Only show main loading on first page load
                if (currentPage === 1) {
                    setLoading(true)
                } else {
                    setLoadingMore(true)
                }
                setError(null)

                const response = await axios.get('https://backend.ithyaraa.com/api/presale/products/paginated', {
                    params: {
                        page: currentPage,
                        limit: 5
                    }
                })

                if (response.data?.success) {
                    // If loading more, append to existing products; otherwise replace
                    if (currentPage > 1) {
                        setProducts(prev => [...prev, ...(response.data.data || [])])
                    } else {
                        setProducts(response.data.data || [])
                    }
                    if (response.data.pagination) {
                        setPagination(response.data.pagination)
                    }
                } else {
                    setError('Failed to fetch products')
                }
            } catch (err) {
                console.error('Error fetching presale products:', err)
                setError(err.message || 'Failed to fetch presale products')
            } finally {
                setLoading(false)
                setLoadingMore(false)
            }
        }

        fetchPresaleProducts()
    }, [currentPage])

    return (
        <div>
            <div className="flex flex-row justify-between px-5 mt-5 items-end mb-3 md:flex-col md:items-center">
                <div className="flex flex-col">
                    <p className="text-lg font-medium md:text-xl">{heading}</p>
                    <p className="text-xs font-semibold text-secondary-text-deep md:text-center md:text-sm">{subHeading}</p>
                </div>
                <button className="bg-primary-yellow h-[30px] px-2 text-xs font-medium rounded md:hidden">
                    Shop Now
                </button>
            </div>
            <div className="py-5">
                <div className="grid gap-10 items-center px-10">
                    {/* <div className="col-span-1 h-[400px] bg-gray-200 rounded-r-lg w-full"></div> */}
                    <div className=" flex">
                        {loading ? (
                            <div className="flex items-center justify-center p-4 w-full">
                                <p>Loading products...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center p-4 w-full">
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
