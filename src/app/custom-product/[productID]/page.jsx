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

const CustomProductDetail = () => {
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
    const [customInputs, setCustomInputs] = useState([]);
    const [customInputValues, setCustomInputValues] = useState({});
    const [count, setCount] = useState(1);
    const [productQuantity, setProductQuantity] = useState(100);
    const [buyMore, setBuyMore] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isBuyNow, setIsBuyNow] = useState(false);
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart.cartCount);
    console.log(cart);

    // Increment
    const handleIncrement = () => {
        if (count < productQuantity) setCount(prev => prev + 1);
    };

    // Decrement
    const handleDecrement = () => {
        if (count > 1) setCount(prev => prev - 1);
    };

    // Handle custom input changes
    const handleCustomInputChange = (inputId, value) => {
        setCustomInputValues(prev => ({
            ...prev,
            [inputId]: value
        }));
    };

    // Validate custom inputs
    const validateCustomInputs = () => {
        if (!Array.isArray(customInputs)) return true; // Skip validation if not an array
        for (const input of customInputs) {
            if (input.required && (!customInputValues[input.id] || customInputValues[input.id].trim() === '')) {
                toast.error(`${input.label} is required`);
                return false;
            }
        }
        return true;
    };

    // Show confirmation modal
    const handleAddToCartClick = () => {
        if (!validateCustomInputs()) {
            return;
        }
        setIsBuyNow(false);
        setShowConfirmModal(true);
    };

    // Handle Buy Now click
    const handleBuyNowClick = () => {
        if (!validateCustomInputs()) {
            return;
        }
        setIsBuyNow(true);
        setShowConfirmModal(true);
    };

    // Actually add to cart after confirmation
    const addToCart = async () => {
        try {
            const cartData = {
                productID: product.productID,
                quantity: count,
                customInputs: customInputValues,
                referBy: referBy
            };

            console.log('Adding custom product to cart:', cartData);

            await dispatch(addCartAsync(cartData));

            if (isBuyNow) {
                toast.success('Added to cart! Redirecting to checkout...');
                // Redirect to cart after a short delay
                setTimeout(() => {
                    window.location.href = '/cart';
                }, 1000);
            } else {
                toast.success('Custom product added to cart successfully!');
            }

            setShowConfirmModal(false);
        } catch (error) {
            console.error('Error adding to cart:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            if (error.response?.status === 401) {
                toast.error('Please login to add items to cart.');
                // Redirect to login page
                window.location.href = '/login';
            } else {
                toast.error('Failed to add item to cart.');
            }
        }
    };

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                console.log('🔍 Fetching product with ID:', productID);
                console.log('🔍 API URL:', `https://72.60.219.181:8800/api/products/details/${productID}`);

                const response = await axios.get(`https://72.60.219.181:8800/api/products/details/${productID}`);

                console.log('✅ API Response:', response);
                console.log('✅ Response data:', response.data);

                const productData = response.data.product; // Extract product from response

                console.log('Fetched custom product:', productData);

                // Helper to safely JSON.parse any field
                const safeParse = (value) => {
                    try {
                        return typeof value === "string" ? JSON.parse(value) : value;
                    } catch {
                        return value;
                    }
                };

                // Parse JSON fields
                const parsedProduct = {
                    ...productData,
                    featuredImage: safeParse(productData.featuredImage) || [],
                    galleryImage: safeParse(productData.galleryImage) || [],
                    custom_inputs: safeParse(productData.custom_inputs) || []
                };

                setProduct(parsedProduct);
                setCustomInputs(parsedProduct.custom_inputs || []);

                // Set featured image
                if (parsedProduct.featuredImage && parsedProduct.featuredImage.length > 0) {
                    setFeaturedImage(parsedProduct.featuredImage[0].imgUrl);
                }

                // Set gallery images
                if (parsedProduct.galleryImage && parsedProduct.galleryImage.length > 0) {
                    setGalleryImages(parsedProduct.galleryImage);
                }

                // Set product quantity
                setProductQuantity(parsedProduct.stock || 100);

            } catch (error) {
                console.error('❌ Error fetching product:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                });
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        if (productID) {
            fetchProduct();
        }
    }, [productID]);

    // Optimised fetchRelatedProducts to decode product images and categories
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const response = await axios.get(`https://72.60.219.181:8800/api/products/shop?limit=8`);
                // Helper to safely JSON.parse any field
                const safeParse = (value) => {
                    try {
                        return typeof value === "string" ? JSON.parse(value) : value;
                    } catch {
                        return value;
                    }
                };

                const jsonFields = ["galleryImage", "featuredImage", "categories"];
                const parsedProducts = (response.data?.data || []).map((product) => {
                    const parsed = { ...product };
                    jsonFields.forEach((field) => {
                        if (field in parsed) {
                            parsed[field] = safeParse(parsed[field]);
                        }
                    });
                    return parsed;
                });

                setBuyMore(parsedProducts);
            } catch (error) {
                console.error('Error fetching related products:', error);
            }
        };

        fetchRelatedProducts();
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (!product) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-lg text-gray-500">Product not found</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className="md:w-[80%] md:mt-10 w-full mb-5">
                <div className="md:grid md:grid-cols-2 md:gap-4 md:w-full flex flex-col gap-4">
                    {/* Product Gallery */}
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
                                <p className="text-primary-yellow font-medium text-xs ml-1 md:text-sm">{product.rating || 4.5}</p>
                            </div>

                            <div className="w-px h-3 bg-secondary-text-deep" />

                            <p className="text-black font-medium text-xs md:text-sm">98 Comments</p>
                        </div>

                        {/* Pricing */}
                        <div className="pricing flex mt-4 items-center gap-3">
                            <p className="text-xl font-medium">₹{product.salePrice || product.regularPrice}</p>
                            {product.salePrice && product.salePrice !== product.regularPrice && (
                                <p className="text-xl font-medium line-through text-secondary-text-deep">₹{product.regularPrice}</p>
                            )}
                            {product.discountValue && (
                                <p className="text-xl font-medium text-green-600">{product.discountValue}% Off</p>
                            )}
                        </div>

                        {/* Custom Input Fields */}
                        {customInputs.length > 0 && (
                            <div className="customInputs mt-5">
                                <div className="flex gap-2 items-center mb-3">
                                    <p className="font-medium text-secondary-text-deep">Customize Your Product</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {Array.isArray(customInputs) && customInputs.map((input, index) => (
                                        <div className="custom-input-field" key={input.id || index}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {input.label}
                                                {input.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>

                                            {input.type === 'select' ? (
                                                <select
                                                    value={customInputValues[input.id] || ''}
                                                    onChange={(e) => handleCustomInputChange(input.id, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required={input.required}
                                                >
                                                    <option value="">{input.placeholder || `Select ${input.label}`}</option>
                                                    {input.options && input.options.map((option, optionIndex) => (
                                                        <option key={optionIndex} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : input.type === 'textarea' ? (
                                                <textarea
                                                    value={customInputValues[input.id] || ''}
                                                    onChange={(e) => handleCustomInputChange(input.id, e.target.value)}
                                                    placeholder={input.placeholder || `Enter ${input.label}`}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows={3}
                                                    required={input.required}
                                                />
                                            ) : (
                                                <input
                                                    type={input.type === 'number' ? 'number' : input.type === 'email' ? 'email' : input.type === 'tel' ? 'tel' : 'text'}
                                                    value={customInputValues[input.id] || ''}
                                                    onChange={(e) => handleCustomInputChange(input.id, e.target.value)}
                                                    placeholder={input.placeholder || `Enter ${input.label}`}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required={input.required}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Action Buttons */}
                        <div className="flex gap-2 items-center mt-6">
                            {/* Quantity selector */}
                            <div className="flex items-center border rounded-lg overflow-hidden w-[120px]">
                                <button
                                    onClick={handleDecrement}
                                    className="flex-1 text-center py-2 border-r select-none cursor-pointer hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <span className="flex-1 text-center py-2">{count.toString().padStart(2, "0")}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="flex-1 text-center py-2 border-l select-none cursor-pointer hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>

                            {/* Action buttons */}
                            <button
                                className="flex-1 py-2 rounded-lg border font-medium text-center cursor-pointer hover:bg-gray-50"
                                onClick={handleAddToCartClick}
                            >
                                Add to Cart
                            </button>
                            <button
                                className="flex-1 py-2 rounded-lg bg-primary-yellow font-medium text-center cursor-pointer hover:bg-yellow-500"
                                onClick={handleBuyNowClick}
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Additional Actions */}
                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center hover:text-secondary-text-deep cursor-pointer">
                                <CiHeart />  <p className="pl-1">Add to Wishlist</p>
                            </div>
                            <div className="flex items-center hover:text-secondary-text-deep cursor-pointer">
                                <CiRuler />  <p className="pl-1">Size Guide</p>
                            </div>
                        </div>

                        {/* Product Tabs */}
                        <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                            <ProductTabs />
                        </Suspense>
                    </div>
                </div>

                <hr className="mt-5 border-gray-200" />

                {/* Related Products */}
                <div className="w-full col-span-2">
                    <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
                        <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
                    </Suspense>
                </div>

                <hr className="mt-5 mb-5 border-gray-200" />

                {/* Reviews */}
                <div className="w-full col-span-2">
                    <Reviews />
                </div>

                {/* Additional Product Sections */}
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

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {isBuyNow ? 'Review Before Purchase' : 'Confirm Your Customization'}
                        </h2>

                        <div className="mb-4">
                            <h3 className="font-medium mb-2">Product: {product.name}</h3>
                            <p className="text-sm text-gray-600">Quantity: {count}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium mb-2">Your Custom Inputs:</h3>
                            <div className="space-y-2">
                                {Array.isArray(customInputs) && customInputs.map((input) => {
                                    const value = customInputValues[input.id] || 'Not provided';
                                    return (
                                        <div key={input.id} className="border-b pb-2">
                                            <p className="text-sm font-medium text-gray-700">{input.label}:</p>
                                            <p className="text-sm text-gray-600">{value}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addToCart}
                                className="flex-1 py-2 px-4 bg-primary-yellow rounded-lg font-medium hover:bg-yellow-500"
                            >
                                {isBuyNow ? 'Proceed to Checkout' : 'Confirm & Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomProductDetail;
