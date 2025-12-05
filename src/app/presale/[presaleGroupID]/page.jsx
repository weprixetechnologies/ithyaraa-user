"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import CountdownTimer from "@/components/products/CountdownTimer";

const PresaleGroupPage = () => {
    const { presaleGroupID } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!presaleGroupID) return;

        const fetchGroup = async () => {
            try {
                const res = await axiosInstance.get(`/presale/groups/${presaleGroupID}`);
                if (!res.data?.success || !res.data?.data) {
                    setGroup(null);
                    return;
                }

                const data = { ...res.data.data };

                const safeParse = (value) => {
                    try {
                        return typeof value === "string" ? JSON.parse(value) : value;
                    } catch {
                        return value;
                    }
                };

                data.bannerImage = safeParse(data.bannerImage) || [];
                data.featuredImage = safeParse(data.featuredImage) || [];

                const products = Array.isArray(data.products) ? data.products.map(p => {
                    const parsed = { ...p };
                    parsed.featuredImage = safeParse(p.featuredImage) || [];
                    return parsed;
                }) : [];

                data.products = products;
                setGroup(data);
            } catch (error) {
                console.error("Failed to fetch presale group:", error);
                setGroup(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [presaleGroupID]);

    const formatDate = (value) => {
        if (!value) return "";
        try {
            const d = new Date(value);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch {
            return "";
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!group) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-600">Pre-sale group not found.</p>
            </div>
        );
    }

    const bannerImageUrl =
        (Array.isArray(group.bannerImage) && group.bannerImage[0]?.imgUrl) ||
        (Array.isArray(group.featuredImage) && group.featuredImage[0]?.imgUrl) ||
        "";

    // Calculate presale status
    const now = new Date();
    const start = group.startDate ? new Date(group.startDate) : null;
    const end = group.endDate ? new Date(group.endDate) : null;
    const isUpcoming = start && now < start;
    const isActive = start && end && now >= start && now <= end;

    return (
        <div className="bg-[#F5F5F5] min-h-screen pb-10">
            <div className="max-w-6xl mx-auto pt-4 px-4 md:px-0">
                {/* Hero / Banner */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    {bannerImageUrl && (
                        <div className="relative w-full h-52 md:h-72">
                            <Image
                                src={bannerImageUrl}
                                alt={group.groupName}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pre-Sale Collection</p>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-1">
                                {group.groupName}
                            </h1>
                            {group.description && (
                                <p className="mt-2 text-sm text-gray-700 max-w-2xl">
                                    {group.description}
                                </p>
                            )}
                            {/* Pre-Sale Countdown */}
                            {isActive && group.endDate && (
                                <div className="mt-3">
                                    <CountdownTimer endTime={group.endDate} label="PRESALE ENDS IN:" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-1 text-xs text-gray-700">
                            <div>
                                <span className="font-semibold mr-1">Starts:</span>
                                <span>{formatDate(group.startDate) || "-"}</span>
                            </div>
                            <div>
                                <span className="font-semibold mr-1">Ends:</span>
                                <span>{formatDate(group.endDate) || "-"}</span>
                            </div>
                            {group.expectedDeliveryDate && (
                                <div className="mt-1 text-purple-700">
                                    <span className="font-semibold mr-1">Expected Delivery:</span>
                                    <span>{formatDate(group.expectedDeliveryDate)}</span>
                                </div>
                            )}
                            {/* Status Badge */}
                            <div className="mt-2">
                                {isUpcoming && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-800 text-xs">
                                        Pre-Sale Starts Soon
                                    </span>
                                )}
                                {isActive && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-green-100 text-green-800 text-xs">
                                        Pre-Sale Live
                                    </span>
                                )}
                                {!isUpcoming && !isActive && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-gray-100 text-gray-700 text-xs">
                                        Pre-Sale Ended
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
                        Products in this Pre-Sale
                    </h2>

                    {(!group.products || group.products.length === 0) ? (
                        <p className="text-sm text-gray-500">
                            No products have been added to this pre-sale group yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {group.products.map((p) => {
                                const imageUrl = p.featuredImage?.[0]?.imgUrl || "";
                                return (
                                    <Link
                                        key={p.presaleProductID}
                                        href={`/presale/product/${p.presaleProductID}`}
                                        className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="relative w-full aspect-[3/4] bg-gray-100">
                                            {imageUrl && (
                                                <Image
                                                    src={imageUrl}
                                                    alt={p.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <p className="text-xs text-gray-500 uppercase mb-1">
                                                Pre-Sale
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                {p.name}
                                            </p>
                                            <div className="mt-1 flex items-baseline gap-1">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₹{p.salePrice || p.regularPrice}
                                                </span>
                                                {p.salePrice && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₹{p.regularPrice}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PresaleGroupPage;


