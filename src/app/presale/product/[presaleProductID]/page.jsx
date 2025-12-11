"use client";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { useState, useEffect, Suspense, lazy, useRef, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
import RollingText from "@/components/ui/rollingText";
import CheckoutLoadingModal from "@/components/ui/CheckoutLoadingModal";

// Lazy load heavy components for better performance
const ProductGallery = lazy(() => import("@/components/products/productGallery"));
const ProductTabs = lazy(() => import("@/components/products/tabsAccordion"));
const ProductSection = lazy(() => import("@/components/home/ProductSection"));
const Reviews = lazy(() => import("@/components/products/reviews"));
const SelectAddress = lazy(() => import("@/components/pageComponents/selectAddress"));
const SelectPayment = lazy(() => import("@/components/pageComponents/selectPayment"));

const ProductDetail = () => {
    const { presaleProductID } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
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
    // Prebooking modal states
    const [showPrebookingModal, setShowPrebookingModal] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [selectedAddressID, setSelectedAddressID] = useState(null)
    const [paymentMode, setPaymentMode] = useState('cod')
    const [placing, setPlacing] = useState(false)
    const [placeError, setPlaceError] = useState('')
    const [showCheckoutModal, setShowCheckoutModal] = useState(false)
    const dispatch = useDispatch()
    const cart = useSelector((state) => state.cart.cartCount)
    const { toggleWishlist, isInWishlist, loading: wishlistLoading, wishlistProductIds } = useWishlist()

    // Check wishlist status - use wishlistProductIds to avoid dependency issues
    const isWishlisted = presaleProductID ? isInWishlist(presaleProductID) : false

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


    // Fetch product (from presale API)
    const fetchedRef = useRef(null);
    useEffect(() => {
        if (!presaleProductID) return;

        const fetchProduct = async () => {
            try {
                const res = await axios.get(`https://api.ithyaraa.com/api/presale/products/${presaleProductID}`);

                if (!res.data?.success || !res.data?.data) {
                    setProduct(null);
                    return;
                }

                let data = res.data.data;

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
                console.error("Failed to fetch presale product details:", err);
            } finally {
                setLoading(false);
            }
        };
        if (fetchedRef.current !== presaleProductID) {
            fetchedRef.current = presaleProductID;
            fetchProduct();
        }
    }, [presaleProductID]);


    // Fetch review stats with guard to avoid refetching on rerenders
    const reviewsFetchedRef = useRef(null);
    useEffect(() => {
        if (!presaleProductID) return;
        if (reviewsFetchedRef.current === presaleProductID) return;
        reviewsFetchedRef.current = presaleProductID;

        const fetchReviewStats = async () => {
            try {
                const res = await axios.get(`https://api.ithyaraa.com/api/reviews/product/${presaleProductID}/stats`);
                if (res.data.success) setReviewStats(res.data.data);
            } catch (error) {
                console.error('Error fetching review stats:', error);
            }
        };

        fetchReviewStats();
    }, [presaleProductID]);

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
    }, [presaleProductID, product]);

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
            `https://api.ithyaraa.com/api/products/all-products?${params.toString()}`
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

    // Pre-sale timing (optional fields on product)
    const now = new Date();
    const start = product.preSaleStartDate ? new Date(product.preSaleStartDate) : null;
    const end = product.preSaleEndDate ? new Date(product.preSaleEndDate) : null;
    const isUpcoming = start && now < start;
    const isActive = start && end && now >= start && now <= end;

    const addToCart = async () => {
        if (!selectedVariation || selectedVariation.variationStock === 0) {
            toast.error('Please select a valid variation.');
            return;
        }

        try {
            console.log('Add to cart data:', {
                presaleProductID,
                referBy,
                quantity: count,
                variationID: selectedVariation.variationID,
                variationName: selectedVariation.variationName
            });

            // Wait for cart addition to complete and verify success
            const cartResult = await dispatch(addCartAsync({
                presaleProductID,
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

    // Handle address selection for prebooking
    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setSelectedAddressID(address?.addressID || null);
    };

    // Handle payment mode selection for prebooking
    const handlePaymentModeSelect = (mode) => {
        // Map UI selection to backend expected values
        const mapped = mode === 'phonepe' ? 'PREPAID' : 'COD';
        setPaymentMode(mapped);
    };

    // Handle wallet change (not used for presale bookings, but required by SelectPayment)
    const handleWalletChange = () => {
        // Wallet not applicable for presale bookings
    };

    // Handle prebooking order placement
    const handlePrebookingOrder = async () => {
        if (!selectedVariation || selectedVariation.variationStock === 0) {
            toast.error('Please select a valid variation.');
            return;
        }

        setPlaceError('');

        // Require selected address
        if (!selectedAddressID) {
            setPlaceError('Please select a delivery address');
            return;
        }

        try {
            setPlacing(true);
            setShowCheckoutModal(true);

            const response = await axiosInstance.post('/presale/place-prebooking-order', {
                addressID: selectedAddressID,
                productID: presaleProductID,
                variationID: selectedVariation?.variationID || null,
                paymentMode,
                quantity: count
            });

            // PhonePe redirect (online payments)
            const redirectUrlRaw = response?.data?.checkoutPageUrl;
            const redirectUrl = typeof redirectUrlRaw === 'string'
                ? redirectUrlRaw
                : redirectUrlRaw?.data?.instrumentResponse?.redirectInfo?.url;

            if (redirectUrl) {
                // Show checkout loading modal for PhonePe
                window.location.href = redirectUrl;
                return;
            }

            // Check if it's a COD order
            if (response?.data?.paymentMode === 'COD' && response?.data?.success) {
                const preBookingID = response?.data?.preBookingID;
                if (preBookingID) {
                    toast.success('Prebooking order placed successfully!');
                    setShowPrebookingModal(false);
                    setShowCheckoutModal(false);
                    // Redirect to presale order-status page
                    router.push(`/presale/order-status/${preBookingID}`);
                    return;
                }
            }

            // Fallback
            toast.success('Prebooking order placed successfully!');
            setShowPrebookingModal(false);
            setShowCheckoutModal(false);
        } catch (error) {
            console.error('Error placing prebooking order:', error);
            setPlaceError(error?.response?.data?.message || 'Failed to place prebooking order');
            setShowCheckoutModal(false);
            toast.error(error?.response?.data?.message || 'Failed to place prebooking order');
        } finally {
            setPlacing(false);
        }
    };

    // Open prebooking modal
    const handlePreBookNow = () => {
        if (!selectedVariation || selectedVariation.variationStock === 0) {
            toast.error('Please select a valid variation.');
            return;
        }
        setShowPrebookingModal(true);
    };

    const handleWishlistToggle = async () => {
        if (!presaleProductID) return;
        await toggleWishlist(presaleProductID);
    };

    return (
        <div className="w-full flex flex-col items-center bg-[#F5F5F5] min-h-screen">
            <div className="mt-2"></div>
            <RollingText text1="PRE ORDER NOW" text2="BOOKING HAVE STARTED" direction="right" />

            <div className="md:w-[80%] md:mt-2 w-full mb-5">
                {/* Pre-Sale badge and title */}
                {/* <div className="px-3 mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <p className="text-xs text-purple-600 uppercase tracking-wide font-semibold">
                            Pre-Sale
                        </p>
                        <p className="text-xl md:text-2xl font-medium">{product.name}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1 text-xs">
                        {isUpcoming && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-800">
                                Pre-Sale Starts Soon
                            </span>
                        )}
                        {isActive && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-green-100 text-green-800">
                                Pre-Sale Live
                            </span>
                        )}
                        {!isUpcoming && !isActive && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-gray-100 text-gray-700">
                                Pre-Sale Ended
                            </span>
                        )}
                        {end && isActive && (
                            <div className="mt-1 text-xs text-gray-600">
                                <span className="font-medium">Pre-Sale Ends In: </span>
                                <CountdownTimer endDate={end} />
                            </div>
                        )}
                        {product.expectedDeliveryDate && (
                            <div className="mt-1 text-xs text-purple-700">
                                <span className="font-medium mr-1">Expected Delivery:</span>
                                <span>
                                    {new Date(product.expectedDeliveryDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div> */}

                <div className="md:grid md:grid-cols-2 md:gap-4 md:w-full flex flex-col gap-4 rounded-lg  p-2 md:p-4">
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

                        {/* Presale Countdown - similar to flash sale countdown */}
                        {isActive && product.preSaleEndDate && (
                            <CountdownTimer endTime={product.preSaleEndDate} label="PRESALE ENDS IN:" />
                        )}

                        {product.isFlashSale && <CountdownTimer endTime={product.flashSaleEndTime} />}

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
                            <button
                                className="flex-1 py-2 rounded-lg text-center cursor-pointer relative overflow-hidden text-black font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                                onClick={handlePreBookNow}
                                style={{
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                                    boxShadow: '0 10px 25px -5px rgba(234, 179, 8, 0.5), 0 0 20px rgba(234, 179, 8, 0.3)',
                                }}
                            >
                                <span className="relative z-10">Pre-Book Now</span>
                                <div
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                    style={{
                                        width: '50%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%)',
                                        animation: 'shine 2.5s infinite ease-in-out',
                                    }}
                                />
                            </button>

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
                            <div className="flex items-center hover:text-secondary-text-deep cursor-pointer">
                                <CiRuler />  <p className="pl-1">Size Guide</p>
                            </div>
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


            </div>
            <RollingText text1="PRE ORDER NOW" text2="BOOKING HAVE STARTED" direction="left" />
            <div className="md:w-[80%] md:mt-10 w-full mb-5">
                {/* <hr className="mt-5 border-gray-200" /> */}
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

            {/* Prebooking Modal */}
            {showPrebookingModal && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Complete Your Prebooking</h2>
                            <button
                                onClick={() => {
                                    setShowPrebookingModal(false);
                                    setPlaceError('');
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                                disabled={placing}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Address Selection */}
                            <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                                <SelectAddress onSelect={handleAddressSelect} showAll={true} />
                            </Suspense>

                            {/* Payment Selection */}
                            <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                                <SelectPayment
                                    onSelect={handlePaymentModeSelect}
                                    onWalletChange={handleWalletChange}
                                    cartTotal={(variationSalePrice || variationPrice || 0) * count}
                                    couponDiscount={0}
                                />
                            </Suspense>

                            {/* Order Summary */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="font-semibold mb-3">Order Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Product:</span>
                                        <span className="font-medium">{product?.name}</span>
                                    </div>
                                    {selectedVariation && (
                                        <div className="flex justify-between">
                                            <span>Variation:</span>
                                            <span className="font-medium">{selectedVariation.variationName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Quantity:</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total:</span>
                                        <span>₹{((variationSalePrice || variationPrice || 0) * count).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {placeError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {placeError}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowPrebookingModal(false);
                                        setPlaceError('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={placing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePrebookingOrder}
                                    disabled={placing || !selectedAddressID}
                                    className="flex-1 px-4 py-2 bg-primary-yellow rounded-lg font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {placing ? 'Placing Order...' : 'Confirm Prebooking'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Loading Modal */}
            <CheckoutLoadingModal isOpen={showCheckoutModal} />
        </div>
    );
};

export default ProductDetail;
