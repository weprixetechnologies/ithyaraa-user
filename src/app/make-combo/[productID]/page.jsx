"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { BsFillStarFill } from "react-icons/bs";
import ProductGallery from "@/components/products/productGallery";
import { toast } from "react-toastify";
import ProductTabs from "@/components/products/tabsAccordion";
import { CiHeart, CiRuler } from "react-icons/ci";
import ProductSection from "@/components/home/ProductSection";
import Reviews from "@/components/products/reviews";
import { useDispatch, useSelector } from "react-redux";
import { addCartComboAsync } from "@/redux/slices/cartSlice";
import SelectCombo from "@/components/products/selectCombo";
import Image from "next/image";
import axiosInstance from "../../../lib/axiosInstance";

const ProductDetail = () => {
    const { productID } = useParams();
    const [comboData, setComboData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [featuredImage, setFeaturedImage] = useState("");
    const [galleryImages, setGalleryImages] = useState([]);
    const [count, setCount] = useState(1);
    const [buyMore, setBuyMore] = useState([]);
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart.cartCount);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedVariations, setSelectedVariations] = useState({});
    const [selectedAttributes, setSelectedAttributes] = useState({});

    // Memoize the selectedAttributes mapping to prevent unnecessary re-renders
    const memoizedSelectedAttributes = useMemo(() =>
        selectedProducts.map((product, index) => selectedAttributes[product.productID] || {}),
        [selectedProducts, selectedAttributes]
    );

    // Current product state for cart (like regular combo)
    const [currentProduct, setCurrentProduct] = useState({
        quantity: 1,
        mainProductID: productID,
        products: []
    });

    // Fetch combo data and available products
    useEffect(() => {
        if (!productID) return;

        const fetchComboData = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/make-combo/detail-user/${productID}`);
                const data = res.data.data;

                setComboData(data);
                setFeaturedImage(data.featuredImage?.[0]?.imgUrl || "");
                setGalleryImages(data.featuredImage || []);
                setAvailableProducts(data.products || []);

                // Open modal immediately when data is loaded
                setIsModalOpen(true);

            } catch (err) {
                console.error("Failed to fetch combo details:", err);
                toast.error("Failed to load combo details");
            } finally {
                setLoading(false);
            }
        };

        fetchComboData();
    }, [productID]);

    // Handle product selection in modal
    const toggleProductSelection = (product) => {
        if (selectedProducts.find(p => p.productID === product.productID)) {
            // Remove product
            setSelectedProducts(prev => prev.filter(p => p.productID !== product.productID));
            // Remove variations and attributes for this product
            const newVariations = { ...selectedVariations };
            const newAttributes = { ...selectedAttributes };
            delete newVariations[product.productID];
            delete newAttributes[product.productID];
            setSelectedVariations(newVariations);
            setSelectedAttributes(newAttributes);
        } else {
            // Add product (max 3)
            if (selectedProducts.length >= 3) {
                toast.error("You can select maximum 3 products");
                return;
            }
            setSelectedProducts(prev => [...prev, product]);
        }
    };

    // Handle attribute selection for a product
    const handleAttributeSelect = (productID, attrName, value) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [productID]: {
                ...prev[productID],
                [attrName]: value
            }
        }));
    };

    const handleRemoveProduct = (productID) => {
        setSelectedProducts(prev => prev.filter(product => product.productID !== productID));

        // Clean up related state
        setSelectedAttributes(prev => {
            const newAttributes = { ...prev };
            delete newAttributes[productID];
            return newAttributes;
        });

        setSelectedVariations(prev => {
            const newVariations = { ...prev };
            delete newVariations[productID];
            return newVariations;
        });

        // Update current product for cart (like regular combo)
        setCurrentProduct(prev => ({
            ...prev,
            products: prev.products.filter(p => p.productID !== productID)
        }));
    };

    // Get filtered variations for a product
    const getFilteredVariations = (variations, productID) => {
        if (!selectedAttributes[productID]) return variations || [];

        return (variations || []).filter(variation => {
            return variation.variationValues.every(attr => {
                const [key, val] = Object.entries(attr)[0];
                return selectedAttributes[productID][key] === val;
            });
        });
    };

    // Handle variation selection
    const handleVariationSelect = (productID, variationID) => {
        setSelectedVariations(prev => ({
            ...prev,
            [productID]: variationID
        }));
    };

    // Auto-select first available variation when attributes change
    useEffect(() => {
        selectedProducts.forEach(product => {
            if (selectedAttributes[product.productID]) {
                const filteredVariations = getFilteredVariations(product.variations, product.productID);
                if (filteredVariations.length > 0 && filteredVariations[0].variationStock > 0) {
                    const variationID = filteredVariations[0].variationID;
                    if (selectedVariations[product.productID] !== variationID) {
                        handleVariationSelect(product.productID, variationID);
                    }
                }
            }
        });
    }, [selectedAttributes, selectedProducts]);

    // Update current product when selections change (like regular combo)
    useEffect(() => {
        const products = selectedProducts.map(product => ({
            productID: product.productID,
            variationID: selectedVariations[product.productID]
        })).filter(p => p.variationID); // Only include products with selected variations

        setCurrentProduct(prev => ({
            ...prev,
            products
        }));
    }, [selectedProducts, selectedVariations]);

    // Close modal and apply selections
    const handleCloseModal = () => {
        if (selectedProducts.length === 0) {
            toast.error("Please select at least one product");
            return;
        }

        // Check if all selected products have variations
        const missingVariations = selectedProducts.filter(p => !selectedVariations[p.productID]);
        if (missingVariations.length > 0) {
            toast.error("Please select variations for all products");
            return;
        }

        setIsModalOpen(false);
        toast.success("Products selected successfully!");
    };

    // Handle variation change after selection
    const handleVariationChange = (productID, variationID) => {
        console.log('Variation changed:', productID, variationID);
        setSelectedVariations(prev => ({
            ...prev,
            [productID]: variationID
        }));
    };

    // Increment/Decrement quantity
    const handleIncrement = () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select products first');
            return;
        }
        setCount(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (count > 1) setCount(prev => prev - 1);
    };

    // Add to cart
    const addToCart = async () => {
        try {
            if (selectedProducts.length === 0) {
                toast.error("Please select products first");
                return;
            }

            // Check if all selected products have variations
            const missingVariations = selectedProducts.filter(p => !selectedVariations[p.productID]);
            if (missingVariations.length > 0) {
                toast.error("Please select variations for all products");
                return;
            }

            console.log('=== MAKE-COMBO ADD CART ===');
            console.log('currentProduct:', currentProduct);
            console.log('Sending to cart:', {
                mainProductID: productID,
                products: currentProduct.products,
                quantity: count,
            });

            await dispatch(
                addCartComboAsync({
                    mainProductID: productID,
                    products: currentProduct.products,
                    quantity: count,
                })
            ).unwrap();

            toast.success("Combo added to cart!");
        } catch (error) {
            console.error(error);
            toast.error("Error adding combo to cart.");
        }
    };

    // Fetch more products for "Must Try" sections
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await axiosInstance.get(`/products/all-products?limit=20&type=variable`);
                const data = res.data.data;

                const parsedProducts = data.map((product) => {
                    const parsed = { ...product };
                    const jsonFields = ["galleryImage", "featuredImage", "categories"];
                    jsonFields.forEach((field) => {
                        if (field in parsed) {
                            try {
                                parsed[field] = typeof parsed[field] === "string" ? JSON.parse(parsed[field]) : parsed[field];
                            } catch {
                                parsed[field] = parsed[field];
                            }
                        }
                    });
                    return parsed;
                });

                setBuyMore(parsedProducts);
            } catch (error) {
                console.error(error);
            }
        }

        fetchProducts();
    }, [productID]);

    if (loading) return <p className="text-center mt-10">Loading combo details...</p>;
    if (!comboData) return <p className="text-center mt-10">Combo not found</p>;

    return (
        <div className="w-full flex flex-col items-center">
            <div className="md:w-[80%] md:mt-10 w-full mb-5">
                <div className="md:grid md:grid-cols-2 md:gap-4 md:w-full flex flex-col gap-4">
                    {/* Product Gallery */}
                    <ProductGallery
                        featuredImage={featuredImage}
                        setFeaturedImage={setFeaturedImage}
                        galleryImages={galleryImages}
                    />

                    {/* Product Info */}
                    <div className="product-data-tab px-3">
                        <p className="text-xs font-medium uppercase text-secondary-text-deep">{comboData.brand}</p>
                        <p className="text-xl md:text-2xl font-medium">{comboData.name}</p>

                        {/* Rating */}
                        <div className="flex flex-row items-center gap-2 mt-2 md:mt-4">
                            <div className="flex items-center gap-1">
                                <div className="flex items-center gap-[2px]">
                                    {[...Array(5)].map((_, i) => (
                                        <BsFillStarFill key={i} className="text-primary-yellow" />
                                    ))}
                                </div>
                                <p className="text-primary-yellow font-medium text-xs ml-1 md:text-sm">{comboData.rating || 4.5}</p>
                            </div>
                            <div className="w-px h-3 bg-secondary-text-deep" />
                            <p className="text-black font-medium text-xs md:text-sm">98 Comments</p>
                        </div>

                        {/* Selected Products Display */}
                        {selectedProducts.length > 0 ? (
                            <div className="py-2">
                                {console.log('Selected Products:', selectedProducts)}
                                <SelectCombo
                                    products={selectedProducts}
                                    onVariationSelect={(productIndex, variationID) => {
                                        const product = selectedProducts[productIndex];
                                        if (product && product.productID) {
                                            handleVariationChange(product.productID, variationID);
                                        } else {
                                            console.warn('Product not found at index:', productIndex, 'selectedProducts:', selectedProducts);
                                        }
                                    }}
                                    selectedAttributes={memoizedSelectedAttributes}
                                    selectedVariations={selectedVariations}
                                    onAttributeSelect={(productIndex, attrName, value) => {
                                        const product = selectedProducts[productIndex];
                                        if (product && product.productID) {
                                            handleAttributeSelect(product.productID, attrName, value);
                                        } else {
                                            console.warn('Product not found at index:', productIndex, 'selectedProducts:', selectedProducts);
                                        }
                                    }}
                                    onRemoveProduct={handleRemoveProduct}
                                />

                                {/* Add More Button - Show when less than 3 products selected */}
                                {selectedProducts.length < 3 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-yellow-400 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                                        >
                                            Add More Products ({selectedProducts.length}/3)
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-4 text-center text-gray-500">
                                <p>No products selected yet</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Select Products
                                </button>
                            </div>
                        )}

                        {/* Pricing */}
                        <div className="pricing flex mt-4 items-center gap-3 mb-5">
                            <p className="text-xl font-medium line-through text-secondary-text-deep">₹{comboData.regularPrice}</p>
                            <p className="text-2xl font-medium">₹{comboData.salePrice}</p>
                            <p className="text-xl font-medium text-green-600">{comboData.discountValue}% Off</p>
                        </div>

                        {/* Quantity and Action Buttons */}
                        <div className="flex gap-2 items-center">
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

                            <button
                                className="flex-1 py-2 rounded-lg border font-medium text-center cursor-pointer"
                                onClick={addToCart}
                                disabled={selectedProducts.length === 0}
                            >
                                Add to Cart
                            </button>
                            <button className="flex-1 py-2 rounded-lg bg-primary-yellow font-medium text-center cursor-pointer">
                                Buy Now
                            </button>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center hover:text-secondary-text-deep cursor-pointer">
                                <CiHeart /> <p className="pl-1">Add to Wishlist</p>
                            </div>
                            <div className="flex items-center hover:text-secondary-text-deep cursor-pointer">
                                <CiRuler /> <p className="pl-1">Size Guide</p>
                            </div>
                        </div>
                        <ProductTabs />
                    </div>
                </div>

                <hr className="mt-5 border-gray-200" />
                <div className="w-full col-span-2">
                    <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
                </div>
                <hr className="mt-5 mb-5 border-gray-200" />

                <div className="w-full col-span-2">
                    <Reviews />
                </div>
                <div className="w-full col-span-2 mt-3">
                    <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
                </div>
                <div className="w-full col-span-2">
                    <ProductSection products={buyMore} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />
                </div>
            </div>

            {/* Product Selection Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold">Select Products for Your Combo</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableProducts.map((product) => {
                                    const isSelected = selectedProducts.find(p => p.productID === product.productID);
                                    const productAttributes = selectedAttributes[product.productID] || {};
                                    const filteredVariations = getFilteredVariations(product.variations, product.productID);

                                    return (
                                        <div
                                            key={product.productID}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                                                }`}
                                            onClick={() => toggleProductSelection(product)}
                                        >
                                            <div className="flex gap-3">
                                                <Image
                                                    src={product.featuredImage?.[0]?.imgUrl || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-lg object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <div className="flex items-center gap-[2px]">
                                                            {[...Array(5)].map((_, i) => (
                                                                <BsFillStarFill key={i} className="text-yellow-400 text-xs" />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-600">{product.rating || 4.5}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-green-600">₹{product.salePrice || product.regularPrice}</p>

                                                    {isSelected && product.productAttributes && (
                                                        <div className="mt-3 space-y-2">
                                                            {product.productAttributes.map((attr, attrIndex) => (
                                                                <div key={attrIndex}>
                                                                    <p className="text-xs font-medium text-gray-700 mb-1">{attr.name}:</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {attr.values.map((value, valueIndex) => (
                                                                            <button
                                                                                key={valueIndex}
                                                                                type="button"
                                                                                className={`px-2 py-1 text-xs border rounded ${productAttributes[attr.name] === value
                                                                                    ? 'bg-blue-500 text-white'
                                                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                                                                    }`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleAttributeSelect(product.productID, attr.name, value);
                                                                                }}
                                                                            >
                                                                                {value}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {filteredVariations.length > 0 && (
                                                                <div className="text-xs">
                                                                    <p className="text-green-600 font-medium">
                                                                        {filteredVariations[0].variationStock > 0 ? 'In Stock' : 'Out of Stock'}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                            <p className="text-sm text-gray-600">
                                Selected: {selectedProducts.length}/3 products
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    disabled={selectedProducts.length === 0}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Apply Selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;