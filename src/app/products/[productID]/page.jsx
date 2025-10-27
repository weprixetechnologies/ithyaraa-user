"use client";
import axios from "axios";
import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BsFillStarFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { CiHeart, CiRuler } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { addCartAsync } from "@/redux/slices/cartSlice";
import Loading from "@/components/ui/loading";

// Lazy load heavy components for better performance
const ProductGallery = lazy(() => import("@/components/products/productGallery"));
const ProductTabs = lazy(() => import("@/components/products/tabsAccordion"));
const ProductSection = lazy(() => import("@/components/home/ProductSection"));
const Reviews = lazy(() => import("@/components/products/reviews"));

const ProductDetail = () => {
    const { productID } = useParams();
    const searchParams = useSearchParams();
    const referBy = searchParams.get('referBy');

    // Debug: Log the referBy parameter
    console.log('URL referBy parameter:', referBy);
    console.log('All search params:', Object.fromEntries(searchParams.entries()));

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [featuredImage, setFeaturedImage] = useState("");
    const [galleryImages, setGalleryImages] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [variationPrice, setVariationPrice] = useState(null);
    const [variationSalePrice, setVariationSalePrice] = useState(null);
    const [count, setCount] = useState(1);
    const [productQuantity, setProductQuantity] = useState(100)
    const [buyMore, setBuyMore] = useState([])
    const [reviewStats, setReviewStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: [
            { rating: 5, count: 0 },
            { rating: 4, count: 0 },
            { rating: 3, count: 0 },
            { rating: 2, count: 0 },
            { rating: 1, count: 0 }
        ]
    });
    const dispatch = useDispatch()
    const cart = useSelector((state) => state.cart.cartCount)
    console.log(cart);

    // Increment
    const handleIncrement = () => {
        if (!selectedVariation) {
            toast.error('Select Variation');
            return;
        }
        if (count < productQuantity) setCount(prev => prev + 1);
    };

    // Decrement
    const handleDecrement = () => {
        if (!selectedVariation) {
            toast.error('Select Variation');
            return;
        }
        if (count > 1) setCount(prev => prev - 1);
    };


    // Fetch product
    useEffect(() => {
        if (!productID) return;

        const fetchProduct = async () => {
            try {
                const res = await axios.get(`https://api.ithyaraa.com:8800/api/products/details/${productID}`);
                let data = res.data.product;

                const safeParse = (value) => {
                    try {
                        return typeof value === "string" ? JSON.parse(value) : value;
                    } catch {
                        return value;
                    }
                };

                ["galleryImage", "featuredImage", "categories", "productAttributes"].forEach((field) => {
                    if (field in data) data[field] = safeParse(data[field]);
                });

                setFeaturedImage(data.featuredImage?.[0]?.imgUrl || "");
                setGalleryImages(data.galleryImage || []);
                setProduct(data);
                console.log(data);

                setVariationPrice(data.regularPrice);
                setVariationSalePrice(data.salePrice);
            } catch (err) {
                console.error("Failed to fetch product details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productID]);

    // Fetch review stats with delay to ensure other scripts load first
    useEffect(() => {
        if (!productID) return;

        const fetchReviewStats = async () => {
            try {
                // Delay of 500ms to let other scripts load first
                await new Promise(resolve => setTimeout(resolve, 500));

                const res = await axios.get(`https://api.ithyaraa.com:8800/api/reviews/product/${productID}/stats`);
                if (res.data.success) {
                    setReviewStats(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching review stats:', error);
                // Keep default stats on error
            }
        };

        fetchReviewStats();
    }, [productID]);

    // Build attribute options from variations
    useEffect(() => {
        if (!product || !product.variations) return;
        console.log(product);

        const toAttributeArray = (variationValues) => {
            try {
                let vals = variationValues;
                if (typeof vals === "string") vals = JSON.parse(vals);
                if (vals && !Array.isArray(vals) && typeof vals === "object") {
                    return Object.entries(vals).map(([k, v]) => ({ [k]: v }));
                }
                return Array.isArray(vals) ? vals : [];
            } catch {
                return [];
            }
        };

        const attributeMap = {};
        product.variations.forEach((variation) => {
            const valuesArr = toAttributeArray(variation.variationValues);
            valuesArr.forEach((obj) => {
                const [attrName, attrValue] = Object.entries(obj)[0];
                if (!attributeMap[attrName]) attributeMap[attrName] = new Set();
                attributeMap[attrName].add(attrValue);
            });
        });

        const attributesArr = Object.entries(attributeMap).map(([name, valuesSet]) => ({
            name,
            values: Array.from(valuesSet),
        }));

        setAttributes(attributesArr);
    }, [productID, product]);

    // Handle selecting variation attributes
    // When selecting a variation
    const handleSelectAttribute = (attrName, value) => {
        const newSelected = { ...selectedAttributes, [attrName]: value };
        setSelectedAttributes(newSelected);

        if (!product || !product.variations) return;

        const match = product.variations.find((v) => {
            const toAttributeArray = (variationValues) => {
                try {
                    let vals = variationValues;
                    if (typeof vals === "string") vals = JSON.parse(vals);
                    if (vals && !Array.isArray(vals) && typeof vals === "object") {
                        return Object.entries(vals).map(([k, v]) => ({ [k]: v }));
                    }
                    return Array.isArray(vals) ? vals : [];
                } catch {
                    return [];
                }
            };
            const vals = toAttributeArray(v.variationValues);
            return vals.every((obj) => {
                const [k, val] = Object.entries(obj)[0];
                return newSelected[k] === val;
            });
        });

        setSelectedVariation(match || null);
        setVariationPrice(match ? match.variationPrice : product.regularPrice);
        setVariationSalePrice(match ? match.variationSalePrice : product.salePrice);

        // Set stock and reset count
        const stock = match ? match.variationStock : 0;
        setProductQuantity(stock);
        setCount(stock > 0 ? 1 : 0);
    };
    async function getProducts({ limit = 20, page = 1, categoryID = "", type = 'variable' } = {}) {
        const params = new URLSearchParams();
        params.append("limit", String(limit));
        params.append("page", String(page));
        if (categoryID) params.append("categoryID", categoryID);
        if (type) params.append("type", type);

        const res = await fetch(
            `https://api.ithyaraa.com:8800/api/products/all-products?${params.toString()}`
        );
        console.log(res);

        if (!res.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await res.json(); // { count, data: [] }

        // Helper to safely JSON.parse any field
        const safeParse = (value) => {
            try {
                return typeof value === "string" ? JSON.parse(value) : value;
            } catch {
                return value;
            }
        };

        const jsonFields = ["galleryImage", "featuredImage", "categories"];

        // Parse each product inside data.data
        const parsedProducts = (data?.data || []).map((product) => {
            const parsed = { ...product };
            jsonFields.forEach((field) => {
                if (field in parsed) {
                    parsed[field] = safeParse(parsed[field]);
                }
            });
            return parsed;
        });

        return {
            count: data.count,
            data: parsedProducts
        };
    }
    useEffect(() => {
        async function fetchProducts() {
            try {
                const data = await getProducts();
                setBuyMore(data.data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchProducts();
    }, [productID]);

    if (loading) return <Loading />
    if (!product) return <p className="text-center mt-10">Product not found</p>;



    const addToCart = async () => {
        if (!selectedVariation || selectedVariation.variationStock === 0) {
            toast.error('Please select a valid variation.');
            return;
        }

        try {
            console.log('Add to cart data:', {
                productID,
                referBy,
                quantity: count,
                variationID: selectedVariation.variationID,
                variationName: selectedVariation.variationName
            });

            await dispatch(addCartAsync({
                productID,
                referBy,
                quantity: count,
                variationID: selectedVariation.variationID,
                variationName: selectedVariation.variationName
            })).unwrap(); // if using Redux Toolkit

            toast.success('Item added to cart!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add item to cart.');
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="md:w-[80%] md:mt-10 w-full mb-5">
                <div className="md:grid md:grid-cols-2 md:gap-4 md:w-full flex flex-col gap-4">
                    {/* Extracted Gallery */}
                    <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
                        <ProductGallery
                            featuredImage={featuredImage}
                            setFeaturedImage={setFeaturedImage}
                            galleryImages={galleryImages}
                        />
                    </Suspense>

                    {/* Product Info */}
                    <div className="product-data-tab px-3">
                        <p className="text-xs font-medium uppercase text-secondary-text-deep">{product.brand}</p>
                        <p className="text-xl md:text-2xl font-medium">{product.name}</p>

                        {/* Rating */}
                        <div className="flex flex-row items-center gap-2 mt-2 md:mt-4">
                            <div className="flex items-center gap-1">
                                <div className="flex items-center gap-[2px]">
                                    {[...Array(5)].map((_, i) => (
                                        <BsFillStarFill key={i} className="text-primary-yellow" />
                                    ))}
                                </div>
                                <p className="text-primary-yellow font-medium text-xs ml-1 md:text-sm">{reviewStats.averageRating.toFixed(1) || '0.0'}</p>
                            </div>

                            <div className="w-px h-3 bg-secondary-text-deep" />

                            <p className="text-black font-medium text-xs md:text-sm">{reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'Review' : 'Reviews'}</p>
                        </div>

                        {/* Pricing */}
                        <div className="pricing flex mt-4 items-center gap-3">
                            <p className="text-xl font-medium">₹{variationSalePrice || variationPrice}</p>
                            {variationSalePrice && variationSalePrice !== variationPrice && (
                                <p className="text-xl font-medium line-through text-secondary-text-deep">₹{variationPrice}</p>
                            )}
                            {product.discountValue && (
                                <p className="text-xl font-medium text-green-600">{product.discountValue}% Off</p>
                            )}
                        </div>

                        {/* Variation Selector */}
                        <div className="variationOptions mt-5">
                            <div className="flex gap-2 items-center mb-3">
                                <p className="font-medium text-secondary-text-deep">Options Tailored For You</p>
                                {selectedVariation && (
                                    <p className={`text-sm font-medium ${selectedVariation.variationStock > 0 ? "text-green-600" : "text-red-600"}`}>
                                        {selectedVariation.variationStock > 0 ? "(In Stock)" : "(Out of Stock)"}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">

                                {attributes.map((attr, index) => (
                                    <div className="option-child flex flex-row gap-10 mb-3 items-center" key={index}>
                                        <p className="text-sm font-medium mb-1">{attr.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {attr.values.map((value, idx) => {
                                                const isSelected = selectedAttributes[attr.name] === value;

                                                if (attr.name.toLowerCase() === "color") {
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleSelectAttribute(attr.name, value)}
                                                            className={`w-8 h-8 rounded-full ${isSelected ? "ring-2 ring-black p-1" : "border-gray-300"}`}
                                                            style={{ backgroundColor: value }}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={idx}
                                                        className={`px-3 py-1 border rounded ${isSelected ? "bg-black text-white" : "bg-white text-black"}`}
                                                        onClick={() => handleSelectAttribute(attr.name, value)}
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            {/* Quantity selector */}
                            <div className="flex items-center border rounded-lg overflow-hidden w-[120px]">
                                <button
                                    onClick={handleDecrement}
                                    className="flex-1 text-center py-2 border-r select-none cursor-pointer"
                                >
                                    -
                                </button>
                                <span className="flex-1 text-center py-2">{count.toString().padStart(2, "0")}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="flex-1 text-center py-2 border-l select-none cursor-pointer"
                                >
                                    +
                                </button>
                            </div>

                            {/* Action buttons */}
                            <button className="flex-1 py-2 rounded-lg border font-medium text-center cursor-pointer " onClick={addToCart}>
                                Add to Cart
                            </button>
                            <button className="flex-1 py-2 rounded-lg bg-primary-yellow font-medium text-center cursor-pointer  ">
                                Buy Now
                            </button>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center hover:text-secondary-text-deep cursor-pointer">
                                <CiHeart />  <p className="pl-1">Add to Wishlist</p>
                            </div>
                            <div className="flex items-center hover:text-secondary-text-deep cursor-pointer">
                                <CiRuler />  <p className="pl-1">Size Guide</p>
                            </div>
                        </div>
                        <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                            <ProductTabs />
                        </Suspense>
                    </div>
                </div>
                <hr className="mt-5 border-gray-200" />
                <div className="w-full col-span-2">
                    <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
                        <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
                    </Suspense>
                </div>
                <hr className="mt-5 mb-5 border-gray-200" />

                <div className="w-full col-span-2">
                    <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
                        <Reviews reviewStats={reviewStats} />
                    </Suspense>
                </div>
                <div className="w-full col-span-2 mt-3">
                    <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
                        <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
                    </Suspense>
                </div>
                <div className="w-full col-span-2">
                    <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
                        <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
