"use client"

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterComponent from "@/components/ui/filterComponent";
import ShopProductGrid from "@/components/ui/ShopProductGrid";
import axiosInstance from "@/lib/axiosInstance";

const Shop = () => {

    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);

    const queryString = useMemo(() => searchParams.toString(), [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get(`/products/shop?${queryString}`);
                if (data?.success) {
                    setProducts(data.data || []);
                    setPagination(data.pagination || null);
                } else {
                    setProducts([]);
                    setPagination(null);
                }
            } catch (e) {
                console.error('Failed to load products', e);
                setProducts([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [queryString]);

    return (
        <div className="py-2 flex justify-center flex-col items-center">
            <div className="w-[90%]">
                <p className="text-xs text-[#c0c0c0] font-medium">
                    Home &gt; Shop
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 w-[90%]">
                <aside className="md:col-span-3 pr-2 py-3  border-black h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                    <p className="text-xl font-medium mb-2">Filters :</p>
                    <hr className="border-gray-200 mt-2" />
                    <FilterComponent />
                </aside>
                <main className="md:col-span-9 py-3 px-2 h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                    <ShopProductGrid products={products} loading={loading} pagination={pagination} />
                </main>
            </div>
        </div>
    )
}

export default Shop
