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
import { useDispatch, useSelector } from "react-redux";
import { addCartAsync, addCartComboAsync } from "@/redux/slices/cartSlice";
import SelectComboSimple from "@/components/products/selectComboSimple";
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
    const dispatch = useDispatch()
    const cart = useSelector((state) => state.cart.cartCount)
    // console.log(cart);
    const [currentProduct, setCurrentProduct] = useState({
        quantity: 1,
        mainProductID: '',
        products: []
    });

    const handleVariationSelect = (productID, variationID) => {
        setCurrentProduct(prev => {
            const updatedProducts = prev.products.filter(p => p.productID !== productID);
            updatedProducts.push({ productID, variationID });
            console.log({ ...prev, products: updatedProducts });

            return { ...prev, products: updatedProducts };
        });
    };
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
                const res = await axios.get(`http://api.ithyaraa.com:8800/api/combo/detail-user/${productID}`);
                let data = res.data.data;
                setFeaturedImage(data.featuredImage?.[0]?.imgUrl || "");
                setGalleryImages(data.featuredImage || []);
                setProduct(data);
                console.log(data);


            } catch (err) {
                console.error("Failed to fetch product details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productID]);


    async function getProducts({ limit = 20, page = 1, categoryID = "", type = 'variable' } = {}) {
        const params = new URLSearchParams();
        params.append("limit", String(limit));
        params.append("page", String(page));
        if (categoryID) params.append("categoryID", categoryID);
        if (type) params.append("type", type);

        const res = await fetch(
            `http://api.ithyaraa.com:8800/api/products/all-products?${params.toString()}`
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



    const addToCart = async () => {
        try {
            console.log(currentProduct);

            await dispatch(
                addCartComboAsync({
                    mainProductID: productID,
                    products: currentProduct.products,
                    quantity: 1,
                })
            ).unwrap(); // Throws error if action is rejected

            // toast.success("Combo added to cart!");
        } catch (error) {
            console.error(error);
            toast.error("Error adding combo to cart.");
        }
    };
    return (
        <div className="w-full flex flex-col items-center" >
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
                        <div className="py-2">
                            <SelectComboSimple products={product.products} onVariationSelect={handleVariationSelect} />
                        </div>
                        {/* Pricing */}
                        <div className="pricing flex mt-4 items-center gap-3 mb-5">
                            <p className="text-xl font-medium line-through text-secondary-text-deep">₹{product.regularPrice}</p>
                            <p className="text-2xl font-medium">₹{product.salePrice}</p>



                            <p className="text-xl font-medium text-green-600">{product.discountValue}% Off</p>

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
                        <ProductTabs
                            tabHeading1="Description"
                            tabData1={product?.description || "No description available."}
                            tab1={product?.tab1}
                            tab2={product?.tab2}
                        />
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
