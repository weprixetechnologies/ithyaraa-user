"use client";
import { useState } from "react";
import { BsFillStarFill } from "react-icons/bs";
import ProductGallery from "@/components/products/productGallery";
import { toast } from "react-toastify";
import ProductTabs from "@/components/products/tabsAccordion";
import { CiHeart, CiRuler } from "react-icons/ci";
import ProductSection from "@/components/home/ProductSection";
import Reviews from "@/components/products/reviews";
import { useDispatch } from "react-redux";
import { addCartComboAsync } from "@/redux/slices/cartSlice";
import SelectComboSimple from "@/components/products/selectComboSimple";
import BuyNowButton from "@/components/BuyNowButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ComboInteractive = ({ productID, product, buyMoreProducts }) => {
    const dispatch = useDispatch();
    const [count, setCount] = useState(1);
    const [productQuantity, setProductQuantity] = useState(100);
    const [showSizeChart, setShowSizeChart] = useState(false);
    
    // Fallback featuredImage logic based on the original component
    const [featuredImage, setFeaturedImage] = useState(product?.featuredImage?.[0]?.imgUrl || "");

    const [currentProduct, setCurrentProduct] = useState({
        quantity: count,
        mainProductID: productID,
        products: []
    });

    const handleVariationSelect = (pid, variationID) => {
        setCurrentProduct(prev => {
            const updatedProducts = prev.products.filter(p => p.productID !== pid);
            updatedProducts.push({ productID: pid, variationID });
            return { ...prev, products: updatedProducts };
        });
    };

    const handleIncrement = () => {
        if (currentProduct.products.length < (product?.products?.length || 1)) {
            toast.error('Select Variations first');
            return;
        }
        if (count < productQuantity) {
            setCount(prev => prev + 1);
            setCurrentProduct(prev => ({ ...prev, quantity: count + 1 }));
        }
    };

    const handleDecrement = () => {
        if (currentProduct.products.length < (product?.products?.length || 1)) {
            toast.error('Select Variations first');
            return;
        }
        if (count > 1) {
            setCount(prev => prev - 1);
            setCurrentProduct(prev => ({ ...prev, quantity: count - 1 }));
        }
    };

    const addToCart = async () => {
        if (currentProduct.products.length < (product?.products?.length || 1)) {
            toast.error('Please select variations for all items in the combo');
            return;
        }
        try {
            await dispatch(
                addCartComboAsync({
                    mainProductID: productID,
                    products: currentProduct.products,
                    quantity: count,
                })
            ).unwrap();
        } catch (error) {
            console.error(error);
            toast.error("Error adding combo to cart.");
        }
    };

    if (!product) return null;

    return (
        <>
            <style>{`
                :root {
                    --pdp-cream:    #faf8f4;
                    --pdp-warm:     #f4f0e8;
                    --pdp-gold:     #b8943a;
                    --pdp-gold-lt:  #e0c97a;
                    --pdp-ink:      #1c1812;
                    --pdp-muted:    #7a7265;
                    --pdp-border:   #e6e0d6;
                    --pdp-red:      #b03030;
                    --pdp-green:    #2e6e49;
                    --pdp-shadow:   0 2px 24px rgba(28,24,18,.07);
                    --pdp-shadow-lg:0 8px 48px rgba(28,24,18,.11);
                }

                .pdp-root {
                    min-height: 100vh;
                    color: var(--pdp-ink);
                    padding-bottom: 80px;
                }

                .pdp-fade-up { animation: pdpFadeUp .65s cubic-bezier(.22,1,.36,1) both; }
                .pdp-d1 { animation-delay:.08s } .pdp-d2 { animation-delay:.16s }
                .pdp-d3 { animation-delay:.24s } .pdp-d4 { animation-delay:.32s }
                .pdp-d5 { animation-delay:.40s }
                @keyframes pdpFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
                
                .pdp-gallery-col {
                    position: sticky;
                    top: 20px;
                    align-self: start;
                }

                .pdp-top-grid {
                    display: grid;
                    grid-template-columns: 1.1fr 0.9fr;
                    gap: 52px;
                    align-items: start;
                }

                @media (max-width: 880px) {
                    .pdp-top-grid { grid-template-columns: 1fr; gap: 28px; }
                    .pdp-gallery-col { position: relative; top: 0; }
                }

                .pdp-brand-pill {
                    display: inline-block;
                    font-size: 9.5px; font-weight: 500; letter-spacing: 2.8px;
                    text-transform: uppercase; color: var(--pdp-gold);
                    border: 1px solid var(--pdp-gold-lt);
                    background: linear-gradient(135deg,rgba(184,148,58,.06),rgba(184,148,58,.13));
                    padding: 4px 14px; border-radius: 99px; margin-bottom: 12px;
                }

                .pdp-name {
                    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
                    font-weight: 400; line-height: 1.12;
                    color: var(--pdp-ink); letter-spacing: -.02em; margin: 0;
                }

                .pdp-rating-row { display:flex; align-items:center; gap:10px; margin-top:12px; flex-wrap:wrap; }
                .pdp-stars { display:flex; gap:3px; }
                .pdp-star  { font-size:11px; color: var(--pdp-gold); }
                .pdp-sep { width:1px; height:11px; background:var(--pdp-border); }
                .pdp-review-ct { font-size:12px; color:var(--pdp-muted); }

                .pdp-price-block { display:flex; align-items:baseline; gap:12px; margin-top:20px; flex-wrap:wrap; }
                .pdp-price-main { font-size: 2.2rem; font-weight: 600; color: var(--pdp-ink); line-height:1; }
                .pdp-price-strike { font-size: 1.05rem; color: var(--pdp-muted); text-decoration: line-through; }
                .pdp-price-badge {
                    font-size: 10px; font-weight: 600; letter-spacing: .6px; text-transform:uppercase;
                    color: #fff; background: var(--pdp-green);
                    padding: 3px 10px; border-radius: 99px;
                }

                .pdp-qty {
                    display: flex; align-items: center; height: 46px;
                    border: 1.5px solid var(--pdp-border); border-radius: 10px;
                    overflow: hidden; background: #fff; width: 120px;
                }
                .pdp-qty-btn {
                    flex: 1; height: 100%; display: flex; align-items: center; justify-content: center;
                    font-size: 20px; cursor: pointer; color: var(--pdp-muted);
                    background: transparent; border: none; transition: all .15s;
                }
                .pdp-qty-btn:hover { background: var(--pdp-warm); color: var(--pdp-ink); }
                .pdp-qty-val { flex: 1; text-align: center; font-size: 14px; font-weight: 500; color: var(--pdp-ink); }

                .pdp-btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 24px; }
                .pdp-btn-cart {
                    flex: 1; height: 46px; border-radius: 10px;
                    border: 1.5px solid var(--pdp-ink); background: #fff;
                    color: var(--pdp-ink); font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: all .2s;
                }
                .pdp-btn-cart:hover { background: var(--pdp-ink); color: #fff; box-shadow: 0 4px 18px rgba(28,24,18,.2); }

                .pdp-icon-actions { display: flex; gap: 20px; margin-top: 20px; }
                .pdp-icon-btn {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 12px; color: var(--pdp-muted); cursor: pointer;
                }

                @media (max-width: 480px) {
                    .pdp-btn-row { flex-direction: column; }
                    .pdp-qty { width: 100%; }
                    .pdp-btn-cart { width: 100%; }
                }
            `}</style>

            <div className="pdp-root">
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 80px" }}>
                    <div className="pdp-top-grid">
                        <div className="pdp-fade-up pdp-gallery-col">
                            <ProductGallery
                                featuredImage={featuredImage}
                                setFeaturedImage={setFeaturedImage}
                                galleryImages={product.featuredImage || []}
                            />
                        </div>

                        <div style={{ padding: "0 10px" }}>
                            <div className="pdp-fade-up pdp-d1">
                                <p className="pdp-brand-pill">Ultimate Offering by Ithyaraa</p>
                                <h1 className="pdp-name">{product.name}</h1>
                            </div>

                            <div className="pdp-rating-row pdp-fade-up pdp-d2">
                                <div className="pdp-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <BsFillStarFill key={i} className="pdp-star" />
                                    ))}
                                </div>
                                <p className="pdp-rating-num">{product.rating || 4.5}</p>
                                <div className="pdp-sep" />
                                <p className="pdp-review-ct">98 reviews</p>
                            </div>

                            <div className="pdp-fade-up pdp-d3" style={{ marginTop: 24 }}>
                                <SelectComboSimple products={product.products} onVariationSelect={handleVariationSelect} />
                            </div>

                            <div className="pdp-price-block pdp-fade-up pdp-d3">
                                <span className="pdp-price-main">₹{product.salePrice}</span>
                                <span className="pdp-price-strike">₹{product.regularPrice}</span>
                                <span className="pdp-price-badge">{product.discountValue || Math.round((1 - product.salePrice / product.regularPrice) * 100)}% Off</span>
                            </div>

                            <div className="pdp-btn-row pdp-fade-up pdp-d4">
                                <div className="pdp-qty">
                                    <button className="pdp-qty-btn" onClick={handleDecrement}>-</button>
                                    <span className="pdp-qty-val">{count.toString().padStart(2, "0")}</span>
                                    <button className="pdp-qty-btn" onClick={handleIncrement}>+</button>
                                </div>

                                <button className="pdp-btn-cart" onClick={addToCart}>
                                    Add to Cart
                                </button>

                                <div style={{ flex: 1 }}>
                                    <BuyNowButton
                                        product={product}
                                        productType="combo"
                                        quantity={count}
                                        disabled={false}
                                    />
                                </div>
                            </div>

                            <div className="pdp-icon-actions pdp-fade-up pdp-d5">
                                <div className="pdp-icon-btn">
                                    <CiHeart /> <span>Add to Wishlist</span>
                                </div>
                                {product?.sizeChartUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setShowSizeChart(true)}
                                        className="pdp-icon-btn"
                                    >
                                        <CiRuler /> <span>Size Guide</span>
                                    </button>
                                )}
                            </div>

                            <div className="pdp-fade-up pdp-d5" style={{ marginTop: 32 }}>
                                <ProductTabs
                                    tabHeading1="Description"
                                    tabData1={product?.description || "No description available."}
                                    tab1={product?.tab1}
                                    tab2={product?.tab2}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pdp-fade-up" style={{ marginTop: 64 }}>
                        <hr style={{ border: "none", borderTop: "1px solid var(--pdp-border)", marginBottom: 48 }} />
                        <ProductSection products={buyMoreProducts} heading={'Must Try Outfits'} subHeading={'Curated Choice Now'} />

                        <div style={{ marginTop: 64 }}>
                            <Reviews />
                        </div>

                        <div style={{ marginTop: 64 }}>
                            <ProductSection products={buyMoreProducts} heading={'Related Combos'} subHeading={'Curated Choice Now'} />
                        </div>
                    </div>
                </div>

                {product?.sizeChartUrl && (
                    <Dialog open={showSizeChart} onOpenChange={(open) => !open && setShowSizeChart(false)}>
                        <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto bg-white p-6 rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Size Guide</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                                <img
                                    src={product.sizeChartUrl}
                                    alt="Size chart"
                                    className="w-full h-auto object-contain rounded-lg shadow-sm"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
};

export default ComboInteractive;
