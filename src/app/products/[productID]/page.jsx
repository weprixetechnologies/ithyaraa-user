"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BsFillStarFill } from "react-icons/bs";
import ProductGallery from "@/components/products/productGallery";
import { toast } from "react-toastify";
import ProductTabs from "@/components/products/tabsAccordion";
import { CiHeart, CiRuler } from "react-icons/ci";
import ProductSection from "@/components/home/ProductSection";
import Reviews from "@/components/products/reviews";
const ProductDetail = () => {
    const { productID } = useParams();
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
                const res = await axios.get(`http://192.168.1.9:3300/api/products/details/${productID}`);
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
                setGalleryImages(data.featuredImage || []);
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

    // Build attribute options from variations
    useEffect(() => {
        if (!product || !product.variations) return;
        console.log(product);

        const attributeMap = {};
        product.variations.forEach((variation) => {
            const valuesArr = JSON.parse(variation.variationValues);
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
            const vals = JSON.parse(v.variationValues);
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
            `http://192.168.1.9:3300/api/products/all-products?${params.toString()}`
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

    if (loading) return <p className="text-center mt-10">Loading product details...</p>;
    if (!product) return <p className="text-center mt-10">Product not found</p>;

    return (
        <div className="w-full flex flex-col items-center">
            <div className="md:w-[80%] md:mt-10 w-full mb-5">
                <div className="md:grid md:grid-cols-2 md:gap-4 md:w-full flex flex-col gap-4">
                    {/* Extracted Gallery */}
                    <ProductGallery
                        featuredImage={featuredImage}
                        setFeaturedImage={setFeaturedImage}
                        galleryImages={galleryImages}
                    />

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
                            <p className="text-xl font-medium">₹{variationPrice}</p>
                            {variationSalePrice && (
                                <p className="text-xl font-medium line-through text-secondary-text-deep">₹{variationSalePrice}</p>
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
                            <button className="flex-1 py-2 rounded-lg border font-medium text-center cursor-pointer ">
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
        </div>
    );
};

export default ProductDetail;
