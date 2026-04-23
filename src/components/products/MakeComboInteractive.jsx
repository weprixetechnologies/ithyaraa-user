"use client";
import { useState, useEffect, useMemo, Suspense, lazy, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { BsFillStarFill, BsStar } from "react-icons/bs";
import { toast } from "react-toastify";
import { CiHeart, CiRuler } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addCartComboAsync } from "@/redux/slices/cartSlice";
import BuyNowButton from "@/components/BuyNowButton";
import SelectCombo from "@/components/products/selectCombo";
import { useWishlist } from "@/contexts/WishlistContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ProductGallery = lazy(() => import("@/components/products/productGallery"));
const ProductTabs = lazy(() => import("@/components/products/tabsAccordion"));
const ProductSection = lazy(() => import("@/components/home/ProductSection"));
const Reviews = lazy(() => import("@/components/products/reviews"));

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionBlock = ({ section }) => (
    <div className="w-full">
        <Suspense fallback={<div className="pdp-skeleton" style={{ height: 360, borderRadius: 16 }} />}>
            <ProductSection products={section.products} heading={section.heading} subHeading={section.subHeading} />
        </Suspense>
    </div>
);

const ReviewsBlock = ({ reviewStats }) => (
    <div className="w-full">
        <Suspense fallback={<div className="pdp-skeleton" style={{ height: 240, borderRadius: 16 }} />}>
            <Reviews reviewStats={reviewStats} />
        </Suspense>
    </div>
);

const Divider = () => (
    <div className="pdp-divider">
        <span className="pdp-divider-gem">◆</span>
    </div>
);

// ─── Product Selection Modal ──────────────────────────────────────────────────
const ProductPickerModal = ({
    isOpen, onClose, availableProducts, selectedProducts,
    selectedAttributes, selectedVariations,
    onToggleProduct, onAttributeSelect, onConfirm,
}) => {
    if (!isOpen) return null;

    const getFilteredVariations = (variations, productID) => {
        if (!selectedAttributes[productID]) return variations || [];
        return (variations || []).filter((v) =>
            (Array.isArray(v.variationValues) ? v.variationValues : []).every((obj) => {
                const [k, val] = Object.entries(obj)[0];
                return selectedAttributes[productID]?.[k] === val;
            })
        );
    };

    return (
        <div className="pdp-modal-overlay">
            <div className="pdp-modal">
                <div className="pdp-modal-header">
                    <div>
                        <p className="pdp-modal-eyebrow">Build Your Combo</p>
                        <h2 className="pdp-modal-title">Select Products</h2>
                    </div>
                    <button className="pdp-modal-close" onClick={onClose} aria-label="Close">×</button>
                </div>

                <div className="pdp-modal-body">
                    <div className="pdp-picker-grid">
                        {availableProducts.map((p) => {
                            const isSelected = !!selectedProducts.find(prod => prod.productID === p.productID);
                            const attrs = selectedAttributes[p.productID] || {};
                            const filtered = getFilteredVariations(p.variations, p.productID);

                            return (
                                <div
                                    key={p.productID}
                                    className={`pdp-picker-card${isSelected ? " --sel" : ""}`}
                                    onClick={() => onToggleProduct(p)}
                                >
                                    <div className="pdp-picker-img-wrap">
                                        <Image
                                            src={p.featuredImage?.[0]?.imgUrl || "https://backend.ithyaraa.com/uploads/placeholder.jpg"}
                                            alt={p.name}
                                            width={88}
                                            height={88}
                                            className="pdp-picker-img"
                                        />
                                        {isSelected && (
                                            <span className="pdp-picker-check">✓</span>
                                        )}
                                    </div>
                                    <div className="pdp-picker-info">
                                        <p className="pdp-picker-name">{p.name}</p>
                                        <div className="pdp-picker-stars">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <BsFillStarFill key={s} className={s <= (p.rating || 4) ? "pdp-star-on" : "pdp-star-off"} />
                                            ))}
                                            <span className="pdp-picker-rating">{p.rating || 4.5}</span>
                                        </div>
                                        <p className="pdp-picker-price">₹{p.salePrice || p.regularPrice}</p>

                                        {isSelected && p.productAttributes && (
                                            <div className="pdp-picker-attrs" onClick={e => e.stopPropagation()}>
                                                {p.productAttributes.map((attr, i) => (
                                                    <div key={i} className="pdp-picker-attr-block">
                                                        <p className="pdp-picker-attr-label">{attr.name}</p>
                                                        <div className="pdp-picker-attr-vals">
                                                            {attr.values.map((val, vi) => (
                                                                <button
                                                                    key={vi}
                                                                    className={`pdp-picker-attr-btn${attrs[attr.name] === val ? " --active" : ""}`}
                                                                    onClick={(e) => { e.stopPropagation(); onAttributeSelect(p.productID, attr.name, val); }}
                                                                >
                                                                    {val}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {filtered.length > 0 && (
                                                    <span className={`pdp-stock ${filtered[0].variationStock > 0 ? "in" : "out"}`} style={{ marginTop: 6 }}>
                                                        <span className="pdp-stock-dot" />
                                                        {filtered[0].variationStock > 0 ? "In Stock" : "Out of Stock"}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pdp-modal-footer">
                    <p className="pdp-modal-count">
                        <span className="pdp-modal-count-num">{selectedProducts.length}</span>
                        <span className="pdp-modal-count-of">/3 selected</span>
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="pdp-btn-outline" onClick={onClose}>Cancel</button>
                        <button
                            className="pdp-btn-confirm"
                            onClick={onConfirm}
                            disabled={selectedProducts.length === 0}
                        >
                            Apply Selection →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MakeComboInteractive = ({ productID, product: comboData, reviewStats, dynamicSections }) => {
    const dispatch = useDispatch();
    const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
    const isWishlisted = productID ? isInWishlist(productID) : false;

    // ── Core state ─────────────────────────────────────────────────────────
    const [featuredImage, setFeaturedImage] = useState(comboData?.featuredImage?.[0]?.imgUrl || "");
    const [count, setCount] = useState(1);
    const [isMounted, setIsMounted] = useState(false);

    // ── Picker state ───────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(!comboData ? false : true); // open by default from old code
    const [availableProducts, setAvailableProducts] = useState(comboData?.products || []);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedVariations, setSelectedVariations] = useState({});
    const [selectedAttributes, setSelectedAttributes] = useState({});

    // ── Cart button state ──────────────────────────────────────────────────
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const cartBtnRef = useRef(null);
    const [showSizeChart, setShowSizeChart] = useState(false);

    // ── currentProduct for cart ────────────────────────────────────────────
    const currentProduct = useMemo(() => ({
        quantity: count,
        mainProductID: productID,
        products: selectedProducts
            .map(p => ({ productID: p.productID, variationID: selectedVariations[p.productID] }))
            .filter(p => p.variationID),
    }), [selectedProducts, selectedVariations, count, productID]);

    const memoizedSelectedAttributes = useMemo(() =>
        selectedProducts.map(p => selectedAttributes[p.productID] || {}),
        [selectedProducts, selectedAttributes]
    );

    useEffect(() => { setIsMounted(true); }, []);

    // ── Auto-select first variation when attrs change ──────────────────────
    useEffect(() => {
        selectedProducts.forEach(prod => {
            if (!selectedAttributes[prod.productID]) return;
            const match = (prod.variations || []).find(v =>
                (Array.isArray(v.variationValues) ? v.variationValues : []).every(obj => {
                    const [k, val] = Object.entries(obj)[0];
                    return selectedAttributes[prod.productID]?.[k] === val;
                })
            );
            if (match && match.variationStock > 0 && selectedVariations[prod.productID] !== match.variationID) {
                setSelectedVariations(prev => ({ ...prev, [prod.productID]: match.variationID }));
            }
        });
    }, [selectedAttributes, selectedProducts]);

    // ── Picker handlers ────────────────────────────────────────────────────
    const toggleProductSelection = (p) => {
        const already = selectedProducts.find(s => s.productID === p.productID);
        if (already) {
            setSelectedProducts(prev => prev.filter(s => s.productID !== p.productID));
            setSelectedVariations(prev => { const n = { ...prev }; delete n[p.productID]; return n; });
            setSelectedAttributes(prev => { const n = { ...prev }; delete n[p.productID]; return n; });
        } else {
            if (selectedProducts.length >= 3) { toast.error("Maximum 3 products allowed"); return; }
            setSelectedProducts(prev => [...prev, p]);
        }
    };

    const handleAttributeSelect = (pid, attrName, value) => {
        setSelectedAttributes(prev => ({ ...prev, [pid]: { ...prev[pid], [attrName]: value } }));
    };

    const handleRemoveProduct = (pid) => {
        setSelectedProducts(prev => prev.filter(p => p.productID !== pid));
        setSelectedVariations(prev => { const n = { ...prev }; delete n[pid]; return n; });
        setSelectedAttributes(prev => { const n = { ...prev }; delete n[pid]; return n; });
    };

    const handleVariationChange = (pid, variationID) => {
        setSelectedVariations(prev => ({ ...prev, [pid]: variationID }));
    };

    const handleConfirmModal = () => {
        if (selectedProducts.length === 0) { toast.error("Please select at least one product"); return; }
        const missing = selectedProducts.filter(p => !selectedVariations[p.productID]);
        if (missing.length > 0) { toast.error("Please select a variation for each product"); return; }
        setIsModalOpen(false);
    };

    // ── Qty ────────────────────────────────────────────────────────────────
    const handleIncrement = () => {
        if (selectedProducts.length === 0) { toast.error("Select products first"); return; }
        setCount(p => p + 1);
    };
    const handleDecrement = () => {
        if (selectedProducts.length === 0) { toast.error("Select products first"); return; }
        if (count > 1) setCount(p => p - 1);
    };

    // ── Add to cart ────────────────────────────────────────────────────────
    const addToCart = async () => {
        if (selectedProducts.length === 0) { toast.error("Select products first"); return; }
        const missing = selectedProducts.filter(p => !selectedVariations[p.productID]);
        if (missing.length > 0) { toast.error("Select a variation for each product"); return; }

        setAddingToCart(true);
        try {
            await dispatch(addCartComboAsync({
                mainProductID: productID,
                products: currentProduct.products,
                quantity: count,
            })).unwrap();
            setAddingToCart(false);
            setCartSuccess(true);
            setTimeout(() => setCartSuccess(false), 2000);
        } catch {
            toast.error("Failed to add combo to cart");
            setAddingToCart(false);
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────
    const discountPct = useMemo(() => {
        if (!comboData) return 0;
        const reg = Number(comboData.regularPrice), sale = Number(comboData.salePrice);
        if (reg > 0 && sale < reg) return Math.round((1 - sale / reg) * 100);
        return Number(comboData.discountValue) || 0;
    }, [comboData]);

    const sectionAbove = dynamicSections?.[0] ?? null;
    const sectionsBelow = dynamicSections?.slice(1) || [];

    if (!comboData) return null;

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
                }

                .pdp-skeleton {
                    background: linear-gradient(90deg,#ede8df 25%,#f5f1ea 50%,#ede8df 75%);
                    background-size: 200% 100%;
                    animation: pdpShimmer 1.5s ease-in-out infinite;
                }
                @keyframes pdpShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

                .pdp-fade-up         { animation: pdpFadeUp .65s cubic-bezier(.22,1,.36,1) both; }
                .pdp-fade-up-d1      { animation-delay:.08s }
                .pdp-fade-up-d2      { animation-delay:.16s }
                .pdp-fade-up-d3      { animation-delay:.24s }
                .pdp-fade-up-d4      { animation-delay:.32s }
                .pdp-fade-up-d5      { animation-delay:.42s }
                @keyframes pdpFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }

                .pdp-gallery-col {
                    position: sticky;
                    top: 20px;
                    align-self: start;
                }

                .pdp-combo-tag {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 10px; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase;
                    color: var(--pdp-gold);
                    background: linear-gradient(135deg, rgba(184,148,58,.08), rgba(184,148,58,.14));
                    border: 1px solid rgba(184,148,58,.3);
                    padding: 5px 13px; border-radius: 99px; margin-top: 16px;
                }

                .pdp-name {
                    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
                    font-weight: 400; line-height: 1.12;
                    color: var(--pdp-ink); letter-spacing: -.02em; margin: 0;
                }

                .pdp-rating-row { display:flex; align-items:center; gap:10px; margin-top:12px; flex-wrap:wrap; }
                .pdp-stars      { display:flex; gap:3px; }
                .pdp-star       { font-size:11px; }
                .pdp-star.on    { color: var(--pdp-gold); }
                .pdp-star.off   { color: var(--pdp-border); }
                .pdp-rating-num { font-size:12px; font-weight:500; color:var(--pdp-gold); }
                .pdp-sep        { width:1px; height:11px; background:var(--pdp-border); }
                .pdp-review-ct  { font-size:12px; color:var(--pdp-muted); }

                .pdp-stock {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 10.5px; font-weight: 500; letter-spacing: .6px; text-transform: uppercase;
                    padding: 3px 10px; border-radius: 99px;
                }
                .pdp-stock.in  { color:var(--pdp-green); background:rgba(46,110,73,.09);  border:1px solid rgba(46,110,73,.2);  }
                .pdp-stock.out { color:var(--pdp-red);   background:rgba(176,48,48,.09);   border:1px solid rgba(176,48,48,.2); }
                .pdp-stock-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
                .pdp-stock.in  .pdp-stock-dot { background:var(--pdp-green); }
                .pdp-stock.out .pdp-stock-dot { background:var(--pdp-red); }

                .pdp-price-block  { display:flex; align-items:baseline; gap:12px; margin-top:20px; flex-wrap:wrap; }
                .pdp-price-main   { font-size:2.2rem; font-weight:600; color:var(--pdp-ink); line-height:1; }
                .pdp-price-strike { font-size:1.05rem; color:var(--pdp-muted); text-decoration:line-through; }
                .pdp-price-badge  {
                    font-size:10px; font-weight:600; letter-spacing:.6px; text-transform:uppercase;
                    color:#fff; background:var(--pdp-green);
                    padding:3px 10px; border-radius:99px;
                }

                .pdp-card { margin-top: 22px; }

                .pdp-selection-panel {
                    border: 1.5px solid var(--pdp-border);
                    border-radius: 14px; overflow: hidden; margin-bottom: 4px;
                }
                .pdp-selection-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 16px; background: var(--pdp-warm); border-bottom: 1px solid var(--pdp-border);
                }
                .pdp-selection-lbl {
                    font-size: 9.5px; font-weight: 600; letter-spacing: 2.2px; text-transform: uppercase; color: var(--pdp-muted);
                }
                .pdp-selection-count { font-size: 11px; color: var(--pdp-muted); }
                .pdp-selection-count strong { color: var(--pdp-gold); font-weight: 600; }
                .pdp-selection-body { padding: 14px 16px; }

                .pdp-empty-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 28px 16px; gap: 10px; text-align: center;
                }
                .pdp-empty-icon {
                    width: 48px; height: 48px; border-radius: 50%;
                    background: var(--pdp-warm); border: 1px solid var(--pdp-border);
                    display: flex; align-items: center; justify-content: center; font-size: 20px;
                }
                .pdp-empty-text { font-size: 13px; color: var(--pdp-muted); margin: 0; }
                .pdp-empty-sub  { font-size: 11px; color: var(--pdp-border); margin: 0; }

                .pdp-add-more {
                    display: flex; align-items: center; justify-content: center; gap: 7px;
                    margin-top: 12px; padding: 9px 16px;
                    border: 1.5px dashed var(--pdp-gold-lt); border-radius: 10px;
                    font-size: 12.5px; font-weight: 500; color: var(--pdp-gold);
                    background: linear-gradient(135deg, rgba(184,148,58,.04), rgba(184,148,58,.08));
                    cursor: pointer; transition: all .18s ease; width: 100%;
                }
                .pdp-add-more:hover {
                    border-color: var(--pdp-gold); background: linear-gradient(135deg, rgba(184,148,58,.09), rgba(184,148,58,.15)); color: var(--pdp-ink);
                }

                .pdp-attr-label {
                    font-size: 9.5px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase; color: var(--pdp-muted);
                    display: block; margin-bottom: 12px;
                }

                .pdp-qty {
                    display: flex; align-items: center; height: 46px; border: 1.5px solid var(--pdp-border);
                    border-radius: 10px; overflow: hidden; background: #fff; flex-shrink: 0;
                }
                .pdp-qty-btn {
                    width: 40px; height: 100%; display: flex; align-items: center; justify-content: center;
                    font-size: 20px; font-weight: 300; cursor: pointer; color: var(--pdp-muted);
                    background: transparent; border: none; transition: all .15s; line-height: 1;
                }
                .pdp-qty-btn:hover { background: var(--pdp-warm); color: var(--pdp-ink); }
                .pdp-qty-val { width: 44px; text-align: center; font-size: 14px; font-weight: 500; color: var(--pdp-ink); user-select: none; }

                .pdp-btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 24px; }

                .pdp-btn-cart {
                    position: relative; overflow: hidden; flex: 1; min-width: 0; height: 46px; border-radius: 10px;
                    border: 1.5px solid var(--pdp-ink); background: #fff; color: var(--pdp-ink); font-size: 13px;
                    font-weight: 500; letter-spacing: .4px; cursor: pointer; transition: border-color .2s, box-shadow .2s;
                    padding: 0 12px; display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;
                }
                .pdp-btn-cart:hover:not(:disabled):not(.loading):not(.success) { background: var(--pdp-ink); color: #fff; box-shadow: 0 4px 18px rgba(28,24,18,.2); }
                .pdp-btn-cart:disabled { opacity:.45; cursor:not-allowed; }
                .pdp-btn-cart .pdp-ripple { position:absolute; border-radius:50%; background:rgba(28,24,18,.15); width:10px; height:10px; transform:scale(0); pointer-events:none; animation:pdpRipple .5s ease-out forwards; }
                @keyframes pdpRipple { to { transform:scale(28); opacity:0; } }
                .pdp-btn-cart.loading { background:var(--pdp-warm); color:var(--pdp-muted); border-color:var(--pdp-border); cursor:not-allowed; }
                .pdp-btn-cart .pdp-cart-label { display:flex; align-items:center; justify-content:center; gap:7px; transition:opacity .15s, transform .15s; }
                .pdp-btn-cart.loading .pdp-cart-label, .pdp-btn-cart.success .pdp-cart-label { opacity:0; transform:translateY(-8px); }
                .pdp-btn-cart .pdp-cart-loading { position:absolute; display:flex; gap:5px; align-items:center; opacity:0; transition:opacity .15s; }
                .pdp-btn-cart.loading .pdp-cart-loading { opacity:1; }
                .pdp-cart-dot { width:6px; height:6px; border-radius:50%; background:var(--pdp-muted); animation:pdpDotBounce .9s ease-in-out infinite; }
                .pdp-cart-dot:nth-child(2) { animation-delay:.15s; } .pdp-cart-dot:nth-child(3) { animation-delay:.3s; }
                @keyframes pdpDotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
                .pdp-btn-cart.success { background:var(--pdp-green); border-color:var(--pdp-green); color:#fff; animation:pdpBtnPop .35s cubic-bezier(.34,1.56,.64,1); }
                @keyframes pdpBtnPop { 0%{transform:scale(1)} 45%{transform:scale(.96)} 100%{transform:scale(1)} }
                .pdp-btn-cart .pdp-cart-success { position:absolute; display:flex; align-items:center; gap:7px; opacity:0; transform:translateY(8px); transition:opacity .2s .05s, transform .2s .05s; font-size:13px; font-weight:500; }
                .pdp-btn-cart.success .pdp-cart-success { opacity:1; transform:translateY(0); }
                .pdp-check-svg  { width:16px; height:16px; }
                .pdp-check-path { stroke:#fff; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; fill:none; stroke-dasharray:20; stroke-dashoffset:20; }
                .pdp-btn-cart.success .pdp-check-path { animation:pdpDrawCheck .35s ease .1s forwards; }
                @keyframes pdpDrawCheck { to { stroke-dashoffset:0; } }
                .pdp-cart-particles { position:absolute; inset:0; pointer-events:none; overflow:visible; }
                .pdp-particle { position:absolute; width:5px; height:5px; border-radius:50%; top:50%; left:50%; opacity:0; }
                .pdp-btn-cart.success .pdp-particle { animation:pdpParticle .6s ease-out forwards; }
                .pdp-particle:nth-child(1) { background:#f59e0b; animation-delay:.05s; --dx:-38px; --dy:-28px; }
                .pdp-particle:nth-child(2) { background:#3a7a55; animation-delay:.07s; --dx: 38px; --dy:-28px; }
                .pdp-particle:nth-child(3) { background:#b03030; animation-delay:.09s; --dx:-44px; --dy:  2px; }
                .pdp-particle:nth-child(4) { background:#b8943a; animation-delay:.06s; --dx: 44px; --dy:  2px; }
                .pdp-particle:nth-child(5) { background:#3a7a55; animation-delay:.08s; --dx:-24px; --dy: 30px; }
                .pdp-particle:nth-child(6) { background:#f59e0b; animation-delay:.10s; --dx: 24px; --dy: 30px; }
                @keyframes pdpParticle { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0)} }

                .pdp-icon-actions { display:flex; gap:20px; margin-top:20px; }
                .pdp-icon-btn { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--pdp-muted); cursor:pointer; background:none; border:none; padding:4px 0; transition:color .18s; }
                .pdp-icon-btn:hover { color:var(--pdp-ink); }
                .pdp-icon-btn.w-on  { color:var(--pdp-red); }
                .pdp-icon-btn:disabled { opacity:.45; cursor:not-allowed; }

                .pdp-trust { display:flex; gap:18px; flex-wrap:wrap; padding:14px 0 0; border-top:1px solid var(--pdp-border); margin-top:16px; }
                .pdp-trust-item { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--pdp-muted); }

                .pdp-divider { display:flex; align-items:center; gap:14px; margin:48px 0; }
                .pdp-divider::before, .pdp-divider::after { content:''; flex:1; height:1px; background:var(--pdp-border); }
                .pdp-divider-gem { color:var(--pdp-gold); font-size:9px; flex-shrink:0; }

                .pdp-modal-overlay { position: fixed; inset: 0; z-index: 9000; background: rgba(14,12,10,.72); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: pdpOverlayIn .2s ease both; }
                @keyframes pdpOverlayIn { from{opacity:0} to{opacity:1} }
                .pdp-modal { background: #fff; border-radius: 20px; max-width: 900px; width: 100%; max-height: 92vh; display: flex; flex-direction: column; box-shadow: 0 32px 80px rgba(14,12,10,.28), 0 8px 24px rgba(14,12,10,.12); animation: pdpModalIn .35s cubic-bezier(.22,1,.36,1) both; overflow: hidden; }
                @keyframes pdpModalIn { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:none} }
                .pdp-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 26px 18px; border-bottom: 1px solid var(--pdp-border); background: var(--pdp-cream); flex-shrink: 0; }
                .pdp-modal-eyebrow { font-size: 9px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--pdp-gold); margin: 0 0 4px; }
                .pdp-modal-title { font-size: 22px; font-weight: 400; color: var(--pdp-ink); letter-spacing: -.02em; margin: 0; }
                .pdp-modal-close { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--pdp-border); background: #fff; font-size: 20px; cursor: pointer; color: var(--pdp-muted); display: flex; align-items: center; justify-content: center; transition: all .15s; }
                .pdp-modal-close:hover { background: var(--pdp-warm); color: var(--pdp-ink); transform: rotate(90deg); }
                .pdp-modal-body { flex: 1; overflow-y: auto; padding: 22px 26px; scrollbar-width: thin; scrollbar-color: var(--pdp-border) transparent; }
                .pdp-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
                .pdp-picker-card { display: flex; gap: 12px; padding: 14px; border: 1.5px solid var(--pdp-border); border-radius: 14px; cursor: pointer; transition: all .2s ease; background: #fff; }
                .pdp-picker-card:hover { border-color: rgba(184,148,58,.5); box-shadow: 0 4px 16px rgba(184,148,58,.1); }
                .pdp-picker-card.--sel { border-color: var(--pdp-gold); background: linear-gradient(135deg,rgba(184,148,58,.04),rgba(184,148,58,.08)); box-shadow: 0 0 0 3px rgba(184,148,58,.15); }
                .pdp-picker-img-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--pdp-border); background: var(--pdp-warm); }
                .pdp-picker-img   { width: 100%; height: 100%; object-fit: cover; }
                .pdp-picker-check { position: absolute; inset: 0; background: rgba(184,148,58,.85); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 700; animation: pdpFadeUp .2s ease both; }
                .pdp-picker-info  { flex: 1; min-width: 0; }
                .pdp-picker-name  { font-size: 13px; font-weight: 500; color: var(--pdp-ink); margin: 0 0 5px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .pdp-picker-stars { display: flex; align-items: center; gap: 2px; margin-bottom: 5px; }
                .pdp-star-on  { color: var(--pdp-gold); font-size: 10px; }
                .pdp-star-off { color: var(--pdp-border); font-size: 10px; }
                .pdp-picker-rating { font-size: 11px; color: var(--pdp-muted); margin-left: 3px; }
                .pdp-picker-price  { font-size: 14px; font-weight: 600; color: var(--pdp-ink); margin: 0 0 8px; }
                .pdp-picker-attrs       { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; border-top: 1px solid var(--pdp-border); padding-top: 8px; }
                .pdp-picker-attr-block  { display: flex; flex-direction: column; gap: 4px; }
                .pdp-picker-attr-label  { font-size: 9.5px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--pdp-muted); margin: 0; }
                .pdp-picker-attr-vals   { display: flex; flex-wrap: wrap; gap: 5px; }
                .pdp-picker-attr-btn { padding: 4px 10px; border-radius: 6px; font-size: 11.5px; border: 1.5px solid var(--pdp-border); background: #fff; color: var(--pdp-ink); cursor: pointer; transition: all .15s; }
                .pdp-picker-attr-btn:hover { border-color: var(--pdp-gold); }
                .pdp-picker-attr-btn.--active { background: var(--pdp-ink); color: #fff; border-color: var(--pdp-ink); }
                .pdp-modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 26px; border-top: 1px solid var(--pdp-border); background: var(--pdp-cream); flex-shrink: 0; }
                .pdp-modal-count { font-size: 13px; color: var(--pdp-muted); margin: 0; }
                .pdp-modal-count-num { font-size: 22px; font-weight: 600; color: var(--pdp-gold); }
                .pdp-modal-count-of  { font-size: 13px; color: var(--pdp-muted); margin-left: 2px; }
                .pdp-btn-outline { padding: 10px 18px; border: 1.5px solid var(--pdp-border); border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; background: #fff; color: var(--pdp-ink); transition: all .15s; }
                .pdp-btn-outline:hover { background: var(--pdp-warm); border-color: var(--pdp-border); }
                .pdp-btn-confirm { padding: 10px 22px; border: none; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; background: var(--pdp-ink); color: #fff; transition: all .18s; letter-spacing: .3px; }
                .pdp-btn-confirm:hover:not(:disabled) { background: #2d2820; box-shadow: 0 4px 18px rgba(28,24,18,.22); transform: translateY(-1px); }
                .pdp-btn-confirm:disabled { opacity: .4; cursor: not-allowed; }

                @media (max-width: 480px) {
                    .pdp-btn-row  { flex-direction: column; gap: 8px; }
                    .pdp-qty      { width: 100%; }
                    .pdp-btn-cart { width: 100%; font-size: 14px; height: 48px; padding: 0 16px; }
                    .pdp-buynow-wrap { display: block; width: 100%; }
                    .pdp-buynow-wrap > * { width: 100% !important; height: 48px !important; padding: 0 16px !important; box-sizing: border-box; }
                    .pdp-picker-grid { grid-template-columns: 1fr; }
                    .pdp-modal-header { padding: 18px; }
                    .pdp-modal-body   { padding: 16px; }
                    .pdp-modal-footer { padding: 14px 16px; flex-direction: column; gap: 12px; align-items: stretch; }
                }

                @media (max-width: 880px) {
                    .pdp-gallery-col { position: relative; top: 0; }
                }
            `}</style>
            <div className="pdp-root">
                <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 20px 72px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "start" }}>

                        <div className="pdp-fade-up pdp-gallery-col">
                            <Suspense fallback={<div className="pdp-skeleton" style={{ height: 520, borderRadius: 16 }} />}>
                                <ProductGallery
                                    featuredImage={featuredImage}
                                    setFeaturedImage={setFeaturedImage}
                                    galleryImages={comboData.featuredImage || []}
                                />
                            </Suspense>
                        </div>

                        <div>
                            <div className="pdp-fade-up pdp-fade-up-d1">
                                <h1 className="pdp-name">{comboData.name}</h1>
                                <span className="pdp-combo-tag">✦ Build Your Combo</span>
                            </div>

                            <div className="pdp-rating-row pdp-fade-up pdp-fade-up-d2">
                                <div className="pdp-stars">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <span key={s} className={`pdp-star ${s <= Math.round(reviewStats.averageRating) ? "on" : "off"}`}>
                                            {s <= Math.round(reviewStats.averageRating) ? <BsFillStarFill /> : <BsStar />}
                                        </span>
                                    ))}
                                </div>
                                <span className="pdp-rating-num">{reviewStats.averageRating.toFixed(1)}</span>
                                <span className="pdp-sep" />
                                <span className="pdp-review-ct">
                                    {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"}
                                </span>
                            </div>

                            <div className="pdp-price-block pdp-fade-up pdp-fade-up-d2">
                                <span className="pdp-price-main">₹{comboData.salePrice}</span>
                                {comboData.salePrice !== comboData.regularPrice && (
                                    <span className="pdp-price-strike">₹{comboData.regularPrice}</span>
                                )}
                                {discountPct > 0 && (
                                    <span className="pdp-price-badge">{discountPct}% off</span>
                                )}
                            </div>

                            <div className="pdp-card pdp-fade-up pdp-fade-up-d3">
                                <div style={{ marginBottom: 18 }}>
                                    <span className="pdp-attr-label">Your Selected Products</span>
                                    <div className="pdp-selection-panel">
                                        <div className="pdp-selection-header">
                                            <span className="pdp-selection-lbl">Combo items</span>
                                            <span className="pdp-selection-count">
                                                <strong>{selectedProducts.length}</strong>/3 selected
                                            </span>
                                        </div>
                                        <div className="pdp-selection-body">
                                            {selectedProducts.length > 0 ? (
                                                <SelectCombo
                                                    products={selectedProducts}
                                                    onVariationSelect={(idx, variationID) => {
                                                        const p = selectedProducts[idx];
                                                        if (p) handleVariationChange(p.productID, variationID);
                                                    }}
                                                    selectedAttributes={memoizedSelectedAttributes}
                                                    selectedVariations={selectedVariations}
                                                    onAttributeSelect={(idx, attrName, value) => {
                                                        const p = selectedProducts[idx];
                                                        if (p) handleAttributeSelect(p.productID, attrName, value);
                                                    }}
                                                    onRemoveProduct={handleRemoveProduct}
                                                />
                                            ) : (
                                                <div className="pdp-empty-state">
                                                    <div className="pdp-empty-icon">🛍️</div>
                                                    <p className="pdp-empty-text">No products selected yet</p>
                                                    <p className="pdp-empty-sub">Pick up to 3 items to build your combo</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedProducts.length < 3 && (
                                        <button className="pdp-add-more" onClick={() => setIsModalOpen(true)}>
                                            <span style={{ fontSize: 16 }}>+</span>
                                            {selectedProducts.length === 0 ? "Choose your products" : `Add more  (${selectedProducts.length}/3)`}
                                        </button>
                                    )}
                                </div>

                                <div className="pdp-btn-row">
                                    <div className="pdp-qty">
                                        <button className="pdp-qty-btn" onClick={handleDecrement}>−</button>
                                        <span className="pdp-qty-val">{count.toString().padStart(2, "0")}</span>
                                        <button className="pdp-qty-btn" onClick={handleIncrement}>+</button>
                                    </div>
                                    <button
                                        ref={cartBtnRef}
                                        className={`pdp-btn-cart${addingToCart ? " loading" : ""}${cartSuccess ? " success" : ""}`}
                                        onClick={(e) => {
                                            const btn = cartBtnRef.current;
                                            if (btn) {
                                                const r = document.createElement("span");
                                                r.className = "pdp-ripple";
                                                const rect = btn.getBoundingClientRect();
                                                r.style.left = `${e.clientX - rect.left - 5}px`;
                                                r.style.top = `${e.clientY - rect.top - 5}px`;
                                                btn.appendChild(r);
                                                setTimeout(() => r.remove(), 600);
                                            }
                                            addToCart();
                                        }}
                                        disabled={addingToCart || cartSuccess || selectedProducts.length === 0}
                                    >
                                        <span className="pdp-cart-label">🛒 Add to Cart</span>
                                        <span className="pdp-cart-loading">
                                            <span className="pdp-cart-dot" />
                                            <span className="pdp-cart-dot" />
                                            <span className="pdp-cart-dot" />
                                        </span>
                                        <span className="pdp-cart-success">
                                            <svg className="pdp-check-svg" viewBox="0 0 16 16">
                                                <polyline className="pdp-check-path" points="2,8 6.5,12.5 14,4" />
                                            </svg>
                                            Added!
                                        </span>
                                        <span className="pdp-cart-particles" aria-hidden="true">
                                            {[1, 2, 3, 4, 5, 6].map(i => <span key={i} className="pdp-particle" />)}
                                        </span>
                                    </button>
                                    <div className="pdp-buynow-wrap">
                                        <BuyNowButton
                                            product={comboData}
                                            productType="make_combo"
                                            selectedItems={selectedProducts.map(p => ({
                                                productID: p.productID,
                                                variationID: selectedVariations[p.productID] || null,
                                                productName: p.name,
                                                variationName: p.selectedVariationName || null,
                                            }))}
                                            quantity={count}
                                            disabled={selectedProducts.length === 0}
                                        />
                                    </div>
                                </div>

                                <div className="pdp-icon-actions">
                                    <button
                                        className={`pdp-icon-btn${isWishlisted ? " w-on" : ""}`}
                                        onClick={() => productID && toggleWishlist(productID)}
                                        disabled={wishlistLoading}
                                    >
                                        {isWishlisted ? <FaHeart size={13} /> : <CiHeart size={15} />}
                                        {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                                    </button>
                                    {comboData?.sizeChartUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setShowSizeChart(true)}
                                            className="pdp-icon-btn"
                                        >
                                            <CiRuler size={15} /> Size Guide
                                        </button>
                                    )}
                                </div>

                                <div className="pdp-trust">
                                    <div className="pdp-trust-item">🚚 Free delivery above ₹499</div>
                                    <div className="pdp-trust-item">↩️ Easy 7-day returns</div>
                                    <div className="pdp-trust-item">🔒 Secure checkout</div>
                                </div>
                            </div>

                            <div className="pdp-fade-up pdp-fade-up-d5" style={{ marginTop: 20 }}>
                                <Suspense fallback={<div className="pdp-skeleton" style={{ height: 120, borderRadius: 12 }} />}>
                                    <ProductTabs
                                        tabHeading1="Description"
                                        tabData1={comboData.description || "No description available."}
                                        tab1={comboData.tab1}
                                        tab2={comboData.tab2}
                                    />
                                </Suspense>
                            </div>
                        </div>
                    </div>

                    {isMounted && (
                        <>
                            {sectionAbove && (
                                <>
                                    <Divider />
                                    <SectionBlock section={sectionAbove} />
                                </>
                            )}
                            <Divider />
                            <ReviewsBlock reviewStats={reviewStats} />
                            {sectionsBelow.map((section) => (
                                <div key={section.id}>
                                    <Divider />
                                    <SectionBlock section={section} />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <ProductPickerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                availableProducts={availableProducts}
                selectedProducts={selectedProducts}
                selectedAttributes={selectedAttributes}
                selectedVariations={selectedVariations}
                onToggleProduct={toggleProductSelection}
                onAttributeSelect={handleAttributeSelect}
                onConfirm={handleConfirmModal}
            />

            {comboData?.sizeChartUrl && (
                <Dialog open={showSizeChart} onOpenChange={(open) => !open && setShowSizeChart(false)}>
                    <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto bg-white p-6 rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Size Guide</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <img
                                src={comboData.sizeChartUrl}
                                alt="Size chart"
                                className="w-full h-auto object-contain rounded-lg shadow-sm"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default MakeComboInteractive;
