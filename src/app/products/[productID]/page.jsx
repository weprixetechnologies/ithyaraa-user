"use client";
import axios from "axios";
import { useState, useEffect, Suspense, lazy, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BsFillStarFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { CiHeart, CiRuler } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addCartAsync } from "@/redux/slices/cartSlice";
import { useWishlist } from "@/contexts/WishlistContext";
import Loading from "@/components/ui/loading";
import CountdownTimer from "@/components/products/CountdownTimer";
// Import modal directly (not lazy) so it's available immediately when needed
import CrossSellModal from "@/components/products/crossSellModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BuyNowButton from "@/components/BuyNowButton";

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
    // Avoid heavy logs per render

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
    const [showCrossSellModal, setShowCrossSellModal] = useState(false)
    const [crossSellProducts, setCrossSellProducts] = useState([])
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
    const { toggleWishlist, isInWishlist, loading: wishlistLoading, wishlistProductIds } = useWishlist()

    // Check wishlist status - use wishlistProductIds to avoid dependency issues
    const isWishlisted = productID ? isInWishlist(productID) : false
    const [showSizeChart, setShowSizeChart] = useState(false);

    // console.log(cart);

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
    const fetchedRef = useRef(null);
    useEffect(() => {
        if (!productID) return;

        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:7885/api/products/details/${productID}`);
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
        if (fetchedRef.current !== productID) {
            fetchedRef.current = productID;
            fetchProduct();
        }
    }, [productID]);


    // Fetch review stats with guard to avoid refetching on rerenders
    const reviewsFetchedRef = useRef(null);
    useEffect(() => {
        if (!productID) return;
        if (reviewsFetchedRef.current === productID) return;
        reviewsFetchedRef.current = productID;

        const fetchReviewStats = async () => {
            try {
                const res = await axios.get(`http://localhost:7885/api/reviews/product/${productID}/stats`);
                if (res.data.success) setReviewStats(res.data.data);
            } catch (error) {
                console.error('Error fetching review stats:', error);
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
            `http://localhost:7885/api/products/all-products?${params.toString()}`
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
    const moreFetchedRef = useRef(false);
    useEffect(() => {
        if (moreFetchedRef.current) return;
        moreFetchedRef.current = true;
        async function fetchProducts() {
            try {
                const data = await getProducts();
                setBuyMore(data.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchProducts();
    }, []);

    // Memoize ProductSection before early returns to maintain consistent hook order
    const memoizedProductSection = useMemo(() => (
        <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
            <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
        </Suspense>
    ), [buyMore]);

    if (loading) return <Loading />
    if (!product) return <p className="text-center mt-10">Product not found</p>;

    // Derived pricing helpers
    const effectiveVariation = selectedVariation || null;
    const effectiveRegularPrice =
        (effectiveVariation && effectiveVariation.variationPrice) ??
        variationPrice ??
        product.regularPrice;

    // This is the main price to show (includes flash sale adjustments from backend when applicable)
    const effectiveDisplayPrice =
        (effectiveVariation && effectiveVariation.variationSalePrice) ??
        variationSalePrice ??
        product.salePrice ??
        effectiveRegularPrice;

    const hasVariationSelected = Boolean(effectiveVariation);

    // Flash/special price: when no variation is selected, compute from regularPrice using discountType/discountValue
    let flashDisplayPrice = effectiveDisplayPrice;
    if (product.isFlashSale && !hasVariationSelected && product.regularPrice != null) {
        const baseRegular = Number(product.regularPrice);
        const dtype = String(product.discountType || '').toLowerCase();
        const dval = Number(product.discountValue || 0);

        if (!Number.isNaN(baseRegular) && dval > 0) {
            if (dtype === 'percentage') {
                flashDisplayPrice = Math.max(0, +(baseRegular * (1 - dval / 100)).toFixed(2));
            } else if (dtype === 'fixed' || dtype === 'flat') {
                flashDisplayPrice = Math.max(0, +(baseRegular - dval).toFixed(2));
            }
        }
    }

    // Previous sale price (before flash sale) – used for middle, struck-through price
    const previousSalePrice =
        product.salePrice &&
            product.salePrice !== product.regularPrice
            ? product.salePrice
            : null;

    const buildOfferActionText = (offer) => {
        if (!offer) return null;
        const { offerType, offerName, buyCount, getCount } = offer;
        const type = String(offerType || '').toLowerCase();

        if (type === 'buy_x_get_y' || type === 'bogo') {
            if (buyCount === 1 && getCount === 1) {
                return { headline: 'Buy 1 Get 1 FREE', action: 'Add 2 to cart to unlock' };
            }
            if (buyCount === 2 && getCount === 1) {
                return { headline: 'Buy 2 Get 1 FREE', action: `Add ${buyCount + getCount} to cart to unlock` };
            }
            return {
                headline: `Buy ${buyCount} Get ${getCount} FREE`,
                action: `Add ${buyCount + getCount} to cart to unlock`
            };
        }
        // fallback for other offer types
        return { headline: offerName || 'Special Offer', action: 'Add to cart to unlock' };
    };

    const offerText = buildOfferActionText(product?.offer);

    const isOutOfStock =
        !selectedVariation ||
        selectedVariation.variationStock <= 0 ||
        count > (selectedVariation.variationStock || 0);

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

            // Wait for cart addition to complete and verify success
            const cartResult = await dispatch(addCartAsync({
                productID,
                referBy,
                quantity: count,
                variationID: selectedVariation.variationID,
                variationName: selectedVariation.variationName
            })).unwrap(); // This will throw if the action fails

            // Only proceed if cart addition was successful
            if (cartResult && (cartResult.success !== false)) {
                toast.success('Item added to cart!');

                // Check if cart response has cross-sell products
                if (cartResult.crossSellProducts && Array.isArray(cartResult.crossSellProducts) && cartResult.crossSellProducts.length > 0) {
                    console.log('✅ Cross-sell products found in cart response:', cartResult.crossSellProducts);
                    setCrossSellProducts(cartResult.crossSellProducts);
                    setShowCrossSellModal(true);
                } else {
                    console.log('⚠️ No cross-sell products in cart response');
                    setCrossSellProducts([]);
                    // Don't show modal if no cross-sell products
                }
            } else {
                // Cart addition failed or returned unsuccessful response
                console.error('Cart addition was not successful:', cartResult);
                toast.error('Failed to add item to cart.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart.');
            // Do not show modal if cart addition failed
        }
    };

    const handleWishlistToggle = async () => {
        if (!productID) return;
        await toggleWishlist(productID);
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
                            {product.isFlashSale && previousSalePrice ? (
                                <>
                                    {/* Flash Price */}
                                    <p className="text-xl font-semibold text-red-600">₹{flashDisplayPrice}</p>
                                    {/* Original sale price (now struck through) */}
                                    <p className="text-lg font-medium line-through text-secondary-text-deep">
                                        ₹{previousSalePrice}
                                    </p>
                                    {/* Regular price (also struck through) */}
                                    {effectiveRegularPrice && (
                                        <p className="text-lg font-medium line-through text-secondary-text-deep">
                                            ₹{effectiveRegularPrice}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-medium">₹{variationSalePrice || variationPrice}</p>
                                    {variationSalePrice && variationSalePrice !== variationPrice && (
                                        <p className="text-xl font-medium line-through text-secondary-text-deep">
                                            ₹{variationPrice}
                                        </p>
                                    )}
                                </>
                            )}
                            {product.discountValue && (
                                <p className="text-xl font-medium text-green-600">{product.discountValue}% Off</p>
                            )}
                        </div>

                        {product.isFlashSale && <CountdownTimer endTime={product.flashSaleEndTime} />}

                        {/* Available Offer Banner */}
                        {product?.offer && offerText && (
                            <div className="pdp-offer-banner" key={product.offer.offerID}>
                                <div className="pdp-offer-inner">
                                    <div className="pdp-offer-top-row">
                                        <div className="pdp-offer-badge-wrap">
                                            <span className="pdp-offer-badge-emoji">🔥</span>
                                        </div>
                                        <div className="pdp-offer-title-block">
                                            <p className="pdp-offer-eyebrow">Limited Offer</p>
                                            <p className="pdp-offer-headline">{offerText.headline}</p>
                                        </div>
                                        <div className="pdp-offer-action-block">
                                            <span className="pdp-offer-action-pill">{offerText.action}</span>
                                        </div>
                                    </div>
                                    <p className="pdp-offer-name-line">
                                        🏷️ <strong>{product.offer.offerName}</strong> — applied automatically at checkout
                                    </p>
                                </div>
                                <div className="pdp-offer-bar-track">
                                    <div className="pdp-offer-bar-fill" />
                                </div>
                                <style>{`
                                    .pdp-offer-banner {
                                        border-radius: 14px;
                                        overflow: hidden;
                                        border: 2px solid #f59e0b;
                                        margin-top: 12px;
                                        box-shadow: 0 4px 20px rgba(245,158,11,0.15);
                                        animation: pdpOfferSlice 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                                        clip-path: inset(0 100% 0 0 round 14px);
                                    }
                                    @keyframes pdpOfferSlice {
                                        0%   { clip-path: inset(0 100%  0 0 round 14px); }
                                        60%  { clip-path: inset(0 0%    0 0 round 14px); }
                                        78%  { clip-path: inset(0 -2%   0 0 round 14px); }
                                        100% { clip-path: inset(0 0%    0 0 round 14px); }
                                    }
                                    .pdp-offer-inner {
                                        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fde68a 60%, #fef3c7 80%, #fffbeb 100%);
                                        background-size: 300% 300%;
                                        animation: pdpOscBgMove 4s ease infinite;
                                        padding: 14px 16px 10px 16px;
                                        position: relative;
                                    }
                                    @keyframes pdpOscBgMove {
                                        0%   { background-position: 0%   50%; }
                                        50%  { background-position: 100% 50%; }
                                        100% { background-position: 0%   50%; }
                                    }
                                    .pdp-offer-top-row {
                                        display: flex;
                                        align-items: center;
                                        gap: 10px;
                                        margin-bottom: 6px;
                                    }
                                    .pdp-offer-badge-wrap {
                                        width: 40px;
                                        height: 40px;
                                        border-radius: 50%;
                                        background: rgba(245,158,11,0.18);
                                        border: 2px solid rgba(245,158,11,0.4);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        flex-shrink: 0;
                                        animation: pdpBadgePulse 2s ease-in-out 0.5s infinite;
                                    }
                                    @keyframes pdpBadgePulse {
                                        0%,100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(245,158,11,0.3); }
                                        50%     { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(245,158,11,0);   }
                                    }
                                    .pdp-offer-badge-emoji {
                                        font-size: 18px;
                                        animation: pdpFireShake 1.5s ease-in-out 0.8s infinite;
                                        display: inline-block;
                                    }
                                    @keyframes pdpFireShake {
                                        0%,100% { transform: rotate(0deg)  scale(1);   }
                                        25%     { transform: rotate(-8deg) scale(1.1); }
                                        75%     { transform: rotate(8deg)  scale(1.1); }
                                    }
                                    .pdp-offer-title-block {
                                        flex: 1;
                                        display: flex;
                                        flex-direction: column;
                                        gap: 1px;
                                    }
                                    .pdp-offer-eyebrow {
                                        font-size: 10px;
                                        font-weight: 700;
                                        color: #b45309;
                                        text-transform: uppercase;
                                        letter-spacing: 1px;
                                        margin: 0;
                                        animation: pdpFadeUp 0.4s ease 0.3s both;
                                    }
                                    .pdp-offer-headline {
                                        font-size: 20px;
                                        font-weight: 900;
                                        margin: 0;
                                        line-height: 1.1;
                                        letter-spacing: -0.3px;
                                        background: linear-gradient(135deg, #d97706, #92400e, #b45309);
                                        -webkit-background-clip: text;
                                        -webkit-text-fill-color: transparent;
                                        background-clip: text;
                                        animation: pdpAmountPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.35s both;
                                    }
                                    @keyframes pdpAmountPop {
                                        0%   { transform: scale(0.6); opacity: 0; }
                                        100% { transform: scale(1);   opacity: 1; }
                                    }
                                    .pdp-offer-action-block {
                                        flex-shrink: 0;
                                        animation: pdpFadeUp 0.4s ease 0.45s both;
                                    }
                                    .pdp-offer-action-pill {
                                        display: inline-block;
                                        font-size: 11px;
                                        font-weight: 700;
                                        color: #78350f;
                                        background: rgba(217,119,6,0.15);
                                        border: 1.5px solid rgba(217,119,6,0.35);
                                        border-radius: 99px;
                                        padding: 4px 10px;
                                        text-align: center;
                                        line-height: 1.3;
                                        animation: pdpPillPop 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.5s both;
                                    }
                                    @keyframes pdpPillPop {
                                        0%   { transform: scale(0.6); opacity: 0; }
                                        100% { transform: scale(1);   opacity: 1; }
                                    }
                                    .pdp-offer-name-line {
                                        font-size: 11px;
                                        color: #b45309;
                                        margin: 0;
                                        font-style: italic;
                                        opacity: 0.9;
                                        animation: pdpFadeUp 0.4s ease 0.55s both;
                                    }
                                    .pdp-offer-name-line strong {
                                        color: #92400e;
                                        font-style: normal;
                                        font-weight: 800;
                                    }
                                    @keyframes pdpFadeUp {
                                        0%   { opacity: 0; transform: translateY(6px); }
                                        100% { opacity: 1; transform: translateY(0);   }
                                    }
                                    .pdp-offer-bar-track {
                                        height: 4px;
                                        background: rgba(245,158,11,0.15);
                                        overflow: hidden;
                                    }
                                    .pdp-offer-bar-fill {
                                        height: 100%;
                                        width: 45%;
                                        background: linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent);
                                        animation: pdpBarSweep 1.8s ease-in-out infinite;
                                    }
                                    @keyframes pdpBarSweep {
                                        0%   { transform: translateX(-120%); }
                                        100% { transform: translateX(320%);  }
                                    }
                                `}</style>
                            </div>
                        )}

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
                            {/* New Buy Now flow (variable/simple products) */}
                            <BuyNowButton
                                product={product}
                                productType={product?.type === 'variable' ? 'variable' : product?.type}
                                selectedVariation={selectedVariation}
                                quantity={count}
                                disabled={isOutOfStock}
                            />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                                className={`flex items-center transition-colors ${isWishlisted
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'hover:text-secondary-text-deep text-gray-600'
                                    } cursor-pointer disabled:opacity-50`}
                            >
                                {isWishlisted ? (
                                    <FaHeart className="text-red-500" />
                                ) : (
                                    <CiHeart />
                                )}
                                <p className="pl-1">{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</p>
                            </button>
                            {product?.type === 'variable' && product?.sizeChartUrl && (
                                <button
                                    type="button"
                                    onClick={() => setShowSizeChart(true)}
                                    className="flex items-center hover:text-secondary-text-deep cursor-pointer"
                                >
                                    <CiRuler />  <p className="pl-1">Size Guide</p>
                                </button>
                            )}
                        </div>
                        <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                            <ProductTabs
                                tabHeading1="Description"
                                tabData1={product.description || "No description available."}
                                tab1={product.tab1}
                                tab2={product.tab2}
                            />
                        </Suspense>
                    </div>
                </div>
                <hr className="mt-5 border-gray-200" />
                <div className="w-full col-span-2">
                    {memoizedProductSection}
                </div>
                <hr className="mt-5 mb-5 border-gray-200" />

                <div className="w-full col-span-2">
                    <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
                        <Reviews reviewStats={reviewStats} />
                    </Suspense>
                </div>
                <div className="w-full col-span-2 mt-3">
                    {memoizedProductSection}
                </div>
                <div className="w-full col-span-2">
                    {memoizedProductSection}
                </div>
            </div>
            <CrossSellModal
                isOpen={showCrossSellModal}
                onClose={() => setShowCrossSellModal(false)}
                products={crossSellProducts}
                loading={false}
            />
            {product?.type === 'variable' && product?.sizeChartUrl && (
                <Dialog open={showSizeChart} onOpenChange={(open) => !open && setShowSizeChart(false)}>
                    <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Size Chart</DialogTitle>
                        </DialogHeader>
                        <div className="mt-2">
                            <img
                                src={product.sizeChartUrl}
                                alt="Size chart"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ProductDetail;
