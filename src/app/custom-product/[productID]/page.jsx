"use client";
import axios from "axios";
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BsFillStarFill, BsStar } from "react-icons/bs";
import { toast } from "react-toastify";
import { CiHeart, CiRuler } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addCartAsync } from "@/redux/slices/cartSlice";
import Loading from "@/components/ui/loading";
import BuyNowButton from "@/components/BuyNowButton";
import { useWishlist } from "@/contexts/WishlistContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const ProductGallery = lazy(() => import("@/components/products/productGallery"));
const ProductTabs = lazy(() => import("@/components/products/tabsAccordion"));
const ProductSection = lazy(() => import("@/components/home/ProductSection"));
const Reviews = lazy(() => import("@/components/products/reviews"));
const CrossSellModal = lazy(() => import("@/components/products/crossSellModal"));

// ─── Constants ────────────────────────────────────────────────────────────────
const SECTION_POOL = ["HOME_HERO", "MUST_TRY", "FEATURING", "NEW_ARRIVAL", "TOP_DEALS"];
const SECTION_META = {
    HOME_HERO: { heading: "Picks Curated For You", subHeading: "Collections You Will Definitely Love" },
    MUST_TRY: { heading: "Must Try Outfits", subHeading: "Curated Choice Now" },
    FEATURING: { heading: "Featured Collections", subHeading: "Handpicked for your style" },
    NEW_ARRIVAL: { heading: "New Arrivals", subHeading: "The latest trends just for you" },
    TOP_DEALS: { heading: "Top Deals", subHeading: "Unbeatable prices on favorites" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeParse = (v) => { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; } };

async function fetchSectionProducts({ limit = 12, sectionid = "" } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (sectionid) params.append("sectionid", sectionid);
    const res = await fetch(`https://backend.ithyaraa.com/api/products/all-products?${params}`);
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return (data?.data || []).map(p => {
        const out = { ...p };
        ["galleryImage", "featuredImage", "categories"].forEach(f => { if (f in out) out[f] = safeParse(out[f]); });
        return out;
    });
}

// ─── Shared sub-components ────────────────────────────────────────────────────
const Divider = () => (
    <div className="pdp-divider"><span className="pdp-divider-gem">◆</span></div>
);

const SectionBlock = ({ section }) => (
    <Suspense fallback={<div className="pdp-skeleton" style={{ height: 360, borderRadius: 16 }} />}>
        <ProductSection products={section.products} heading={section.heading} subHeading={section.subHeading} />
    </Suspense>
);

const ReviewsBlock = ({ reviewStats }) => (
    <Suspense fallback={<div className="pdp-skeleton" style={{ height: 240, borderRadius: 16 }} />}>
        <Reviews reviewStats={reviewStats} />
    </Suspense>
);

// ─── Confirm Drawer ───────────────────────────────────────────────────────────
const ConfirmDrawer = ({ open, onClose, product, count, customInputs, customInputValues, selectedDressType, isBuyNow, onConfirm }) => {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="cpd-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="cpd-drawer">
                <div className="cpd-drawer-hd">
                    <div>
                        <p className="cpd-eyebrow">Almost there</p>
                        <h2 className="cpd-title">{isBuyNow ? "Review Your Order" : "Confirm Customisation"}</h2>
                    </div>
                    <button className="cpd-x" onClick={onClose}>×</button>
                </div>

                <div className="cpd-drawer-bd">
                    <div className="cpd-product-row">
                        <div className="cpd-thumb">
                            <img
                                src={product?.featuredImage?.[0]?.imgUrl || ""}
                                alt={product?.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={e => { e.target.style.display = "none"; }}
                            />
                        </div>
                        <div className="cpd-product-meta">
                            <p className="cpd-product-name">{product?.name}</p>
                            <p className="cpd-product-qty">Qty: {count}</p>
                            {selectedDressType && (
                                <p className="cpd-product-dress">{selectedDressType.label} · ₹{selectedDressType.price}</p>
                            )}
                        </div>
                    </div>

                    {Array.isArray(customInputs) && customInputs.length > 0 && (
                        <div className="cpd-inputs-summary">
                            <p className="cpd-summary-lbl">Your Customisations</p>
                            {customInputs.map(inp => (
                                <div key={inp.id} className="cpd-summary-row">
                                    <span className="cpd-summary-key">{inp.label}</span>
                                    <span className="cpd-summary-val">
                                        {customInputValues[inp.id] || <em style={{ color: "#c5bdb3", fontStyle: "normal" }}>Not provided</em>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="cpd-drawer-ft">
                    <button className="cpd-btn-ghost" onClick={onClose}>← Edit</button>
                    <button className="cpd-btn-dark" onClick={onConfirm}>
                        {isBuyNow ? "Proceed to Checkout →" : "Confirm & Add to Cart →"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomProductDetail = () => {
    const { productID } = useParams();
    const searchParams = useSearchParams();
    const referBy = searchParams.get("referBy");
    const dispatch = useDispatch();
    const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
    const isWishlisted = productID ? isInWishlist(productID) : false;
    const [showSizeChart, setShowSizeChart] = useState(false);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [featuredImage, setFeaturedImage] = useState("");
    const [galleryImages, setGalleryImages] = useState([]);
    const [customInputs, setCustomInputs] = useState([]);
    const [customInputValues, setCustomInputValues] = useState({});
    const [customerUploadedImage, setCustomerUploadedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [count, setCount] = useState(1);
    const [productQuantity, setProductQuantity] = useState(100);
    const [dressTypes, setDressTypes] = useState([]);
    const [selectedDressType, setSelectedDressType] = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [isBuyNow, setIsBuyNow] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const [showCrossSell, setShowCrossSell] = useState(false);
    const [crossSellProducts, setCrossSellProducts] = useState([]);
    const cartBtnRef = useRef(null);

    const [sections, setSections] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [reviewStats, setReviewStats] = useState({
        totalReviews: 0, averageRating: 0,
        ratingBreakdown: [5, 4, 3, 2, 1].map(r => ({ rating: r, count: 0 })),
    });
    const sectionsFetched = useRef(false);

    // ── Fetch product ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!productID) return;
        (async () => {
            try {
                setLoading(true);
                const res = await axios.get(`https://backend.ithyaraa.com/api/products/details/${productID}`);
                const raw = res.data.product;
                const data = {
                    ...raw,
                    featuredImage: safeParse(raw.featuredImage) || [],
                    galleryImage: safeParse(raw.galleryImage) || [],
                    custom_inputs: safeParse(raw.custom_inputs) || [],
                };
                setProduct(data);
                setCustomInputs(data.custom_inputs || []);
                const dts = safeParse(raw.dressTypes) || [];
                setDressTypes(dts);
                if (dts.length === 1) setSelectedDressType(dts[0]);
                setFeaturedImage(data.featuredImage?.[0]?.imgUrl || "");
                setGalleryImages(data.galleryImage || []);
                setProductQuantity(data.stock || 100);
            } catch {
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        })();
    }, [productID]);

    // ── Review stats ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!productID) return;
        axios.get(`https://backend.ithyaraa.com/api/reviews/product/${productID}/stats`)
            .then(r => { if (r.data.success) setReviewStats(r.data.data); })
            .catch(() => { });
    }, [productID]);

    // ── Sections ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (sectionsFetched.current) return;
        sectionsFetched.current = true;
        (async () => {
            const shuffled = [...SECTION_POOL].sort(() => Math.random() - 0.5);
            const out = []; const seen = new Set();
            for (const id of shuffled) {
                if (out.length >= 3 || seen.has(id)) continue;
                seen.add(id);
                try {
                    const prods = await fetchSectionProducts({ sectionid: id });
                    if (prods.length) out.push({ id, products: prods, ...SECTION_META[id] });
                } catch { }
            }
            setSections(out);
        })();
    }, []);

    useEffect(() => { setIsMounted(true); }, []);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleIncrement = () => { if (count < productQuantity) setCount(p => p + 1); };
    const handleDecrement = () => { if (count > 1) setCount(p => p - 1); };
    const handleInputChange = (id, val) => setCustomInputValues(p => ({ ...p, [id]: val }));
    const handleDressType = (label) => setSelectedDressType(dressTypes.find(d => d.label === label) || null);

    const validate = () => {
        if (dressTypes.length > 0 && !selectedDressType) {
            toast.error("Please select a dress type");
            return false;
        }
        return true;
    };

    const handleAddToCartClick = () => {
        if (!validate()) return;
        setIsBuyNow(false);
        setShowConfirm(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
        setUploadingImage(true);
        try {
            const zone = "ithyaraa";
            const region = "sg.storage.bunnycdn.com";
            const cdn = "https://ithyaraa.b-cdn.net";
            const key = "7017f7c4-638b-48ab-add3858172a8-f520-4b88";
            const name = `customer-upload-${Date.now()}-${encodeURIComponent(file.name)}`;
            const res = await fetch(`https://${region}/${zone}/${name}`, {
                method: "PUT",
                headers: { AccessKey: key, "Content-Type": file.type },
                body: file,
            });
            if (!res.ok) throw new Error();
            setCustomerUploadedImage(`${cdn}/${name}`);
            toast.success("Image uploaded successfully");
        } catch {
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const addToCart = async () => {
        const inputs = { ...customInputValues };
        if (customerUploadedImage) inputs.customerUploadedImage = customerUploadedImage;
        setAddingToCart(true);
        try {
            const result = await dispatch(addCartAsync({
                productID: product.productID,
                quantity: count,
                customInputs: inputs,
                selectedDressType,
                referBy,
            })).unwrap();
            setShowConfirm(false);
            if (isBuyNow) {
                setTimeout(() => { window.location.href = "/cart"; }, 1000);
            } else {
                setCartSuccess(true);
                setTimeout(() => setCartSuccess(false), 2000);
                if (result?.crossSellProducts?.length) {
                    setCrossSellProducts(result.crossSellProducts);
                    setShowCrossSell(true);
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                toast.error("Please login to add items to cart.");
                window.location.href = "/login";
            } else {
                toast.error("Failed to add item to cart.");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────
    const activePrice = selectedDressType
        ? selectedDressType.price
        : (product?.salePrice || product?.regularPrice);

    const showStrike = !selectedDressType
        && product?.salePrice
        && product.salePrice !== product.regularPrice;

    const discountPct = (() => {
        if (!product || selectedDressType) return 0;
        const reg = Number(product.regularPrice), sale = Number(product.salePrice);
        if (reg > 0 && sale < reg) return Math.round((1 - sale / reg) * 100);
        return Number(product.discountValue) || 0;
    })();

    const sectionAbove = sections[0] ?? null;
    const sectionsBelow = sections.slice(1);

    if (loading) return <Loading />;
    if (!product) return <p style={{ textAlign: "center", marginTop: 40 }}>Product not found</p>;

    return (
        <>
            <style>{`
                :root {
                    --pdp-cream:     #faf8f4;
                    --pdp-warm:      #f4f0e8;
                    --pdp-gold:      #b8943a;
                    --pdp-gold-lt:   #e0c97a;
                    --pdp-gold-glow: rgba(184,148,58,.12);
                    --pdp-ink:       #1c1812;
                    --pdp-muted:     #7a7265;
                    --pdp-border:    #e6e0d6;
                    --pdp-red:       #b03030;
                    --pdp-green:     #2e6e49;
                    --pdp-shadow:    0 2px 24px rgba(28,24,18,.07);
                }

                .pdp-root { background: var(--pdp-cream); min-height: 100vh; color: var(--pdp-ink); }

                /* shimmer */
                .pdp-skeleton {
                    background: linear-gradient(90deg,#ede8df 25%,#f5f1ea 50%,#ede8df 75%);
                    background-size: 200% 100%;
                    animation: pdpShimmer 1.5s ease-in-out infinite;
                }
                @keyframes pdpShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

                /* entrance */
                .pdp-fade-up { animation: pdpFadeUp .65s cubic-bezier(.22,1,.36,1) both; }
                .pdp-d1 { animation-delay:.08s } .pdp-d2 { animation-delay:.16s }
                .pdp-d3 { animation-delay:.24s } .pdp-d4 { animation-delay:.32s }
                .pdp-d5 { animation-delay:.42s }
                @keyframes pdpFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
                
                .pdp-gallery-col {
                    position: sticky;
                    top: 20px;
                    align-self: start;
                }

                /*
                 * Top grid: gallery column is 1.1fr so the image naturally
                 * gets more horizontal room — combined with the ProductGallery
                 * component rendering taller (it fills its container), images
                 * appear bigger while maintaining aspect ratio.
                 */
                .pdp-top-grid {
                    display: grid;
                    grid-template-columns: 1.15fr 1fr;
                    gap: 52px;
                    align-items: start;
                }
                @media (max-width: 880px) {
                    .pdp-top-grid { grid-template-columns: 1fr; gap: 28px; }
                    .pdp-gallery-col { position: relative; top: 0; }
                }

                /* brand pill */
                .pdp-brand-pill {
                    display: inline-block;
                    font-size: 9.5px; font-weight: 500; letter-spacing: 2.8px;
                    text-transform: uppercase; color: var(--pdp-gold);
                    border: 1px solid var(--pdp-gold-lt);
                    background: linear-gradient(135deg,rgba(184,148,58,.06),rgba(184,148,58,.13));
                    padding: 4px 14px; border-radius: 99px; margin-bottom: 12px;
                }

                /* name */
                .pdp-name {
                    font-size: clamp(1.5rem, 3vw, 2rem);
                    font-weight: 500; line-height: 1.12;
                    color: var(--pdp-ink); letter-spacing: -.02em; margin: 0;
                }

                /* mto tag */
                .pdp-mto-tag {
                    display: inline-flex; align-items: center; gap: 6px; margin-top: 14px;
                    font-size: 10px; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase;
                    color: var(--pdp-gold);
                    background: linear-gradient(135deg,rgba(184,148,58,.08),rgba(184,148,58,.14));
                    border: 1px solid rgba(184,148,58,.3);
                    padding: 5px 13px; border-radius: 99px;
                }

                /* rating */
                .pdp-rating-row { display:flex; align-items:center; gap:10px; margin-top:14px; flex-wrap:wrap; }
                .pdp-stars { display:flex; gap:3px; }
                .pdp-star.on  { font-size:11px; color:var(--pdp-gold); }
                .pdp-star.off { font-size:11px; color:var(--pdp-border); }
                .pdp-rating-num { font-size:12px; font-weight:500; color:var(--pdp-gold); }
                .pdp-sep { width:1px; height:11px; background:var(--pdp-border); }
                .pdp-review-ct { font-size:12px; color:var(--pdp-muted); }

                /* price */
                .pdp-price-block  { display:flex; align-items:baseline; gap:12px; margin-top:20px; flex-wrap:wrap; }
                .pdp-price-main   { font-size:2.2rem; font-weight:600; color:var(--pdp-ink); line-height:1; transition:color .2s; }
                .pdp-price-strike { font-size:1.05rem; color:var(--pdp-muted); text-decoration:line-through; }
                .pdp-price-badge  {
                    font-size:10px; font-weight:600; letter-spacing:.6px; text-transform:uppercase;
                    color:#fff; background:var(--pdp-green); padding:3px 10px; border-radius:99px;
                }

                /*
                 * Section heading used OUTSIDE the white card — renders with
                 * the page's cream background so there is no white box visible.
                 */
                .pdp-out-hd {
                    font-size: 9.5px; font-weight: 600; letter-spacing: 2.8px;
                    text-transform: uppercase; color: var(--pdp-muted);
                    display: flex; align-items: center; gap: 10px;
                    margin: 22px 0 12px;
                }
                .pdp-out-hd::after {
                    content:''; flex:1; height:1px;
                    background: linear-gradient(to right, var(--pdp-border), transparent);
                }

                /* dress type pills */
                .pdp-dt-grid { display:flex; flex-wrap:wrap; gap:8px; }
                .pdp-dt-btn {
                    padding: 9px 18px; border-radius: 10px;
                    border: 1.5px solid var(--pdp-border); background: #fff;
                    color: var(--pdp-ink); cursor: pointer; transition: all .18s ease;
                    display: flex; flex-direction: column; align-items: center; gap: 1px;
                    font-family: inherit;
                }
                .pdp-dt-btn:hover { border-color: var(--pdp-gold-lt); background: var(--pdp-warm); }
                .pdp-dt-btn.active {
                    background: var(--pdp-ink); color: #fff; border-color: var(--pdp-ink);
                    box-shadow: 0 4px 14px rgba(28,24,18,.18);
                }
                .pdp-dt-label { font-size: 13px; font-weight: 400; }
                .pdp-dt-price { font-size: 11px; font-weight: 500; opacity: .65; }
                .pdp-dt-btn.active .pdp-dt-price { color: var(--pdp-gold-lt); opacity: 1; }

                /* upload zone */
                .pdp-upload-zone {
                    border: 2px dashed var(--pdp-border); border-radius: 12px;
                    padding: 28px 20px; text-align: center; cursor: pointer;
                    transition: all .2s ease; background: var(--pdp-cream); display: block;
                }
                .pdp-upload-zone:hover { border-color: var(--pdp-gold-lt); background: var(--pdp-warm); }
                .pdp-upload-icon { font-size: 30px; margin-bottom: 8px; opacity: .45; }
                .pdp-upload-text { font-size: 13px; color: var(--pdp-muted); margin: 0; }
                .pdp-upload-sub  { font-size: 11px; color: var(--pdp-border); margin: 4px 0 0; }
                .pdp-uploaded-wrap { display:flex; flex-direction:column; align-items:center; gap:12px; padding:14px 0; }
                .pdp-uploaded-img  { width:110px; height:110px; border-radius:12px; object-fit:cover; border:1px solid var(--pdp-border); box-shadow:var(--pdp-shadow); }
                .pdp-upload-actions { display:flex; gap:8px; }
                .pdp-upload-btn { padding:6px 14px; border-radius:7px; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; transition:all .15s; }
                .pdp-upload-btn.remove { border:1.5px solid rgba(176,48,48,.3); color:var(--pdp-red); background:rgba(176,48,48,.06); }
                .pdp-upload-btn.remove:hover { background:rgba(176,48,48,.13); }
                .pdp-upload-btn.change { border:1.5px solid var(--pdp-border); color:var(--pdp-ink); background:var(--pdp-warm); }
                .pdp-upload-btn.change:hover { background:var(--pdp-border); }

                /* custom input fields */
                .pdp-input-block { margin-bottom: 14px; }
                .pdp-input-lbl {
                    display: block; font-size: 10px; font-weight: 600;
                    letter-spacing: 1.5px; text-transform: uppercase;
                    color: var(--pdp-muted); margin-bottom: 6px;
                }
                .pdp-input-lbl em { color: var(--pdp-red); font-style: normal; margin-left: 2px; }
                .pdp-field, .pdp-select, .pdp-textarea {
                    width: 100%; padding: 10px 13px; box-sizing: border-box;
                    border: 1.5px solid var(--pdp-border); border-radius: 8px;
                    font-size: 13.5px; color: var(--pdp-ink); background: var(--pdp-cream);
                    outline: none; transition: all .2s ease; font-family: inherit;
                }
                .pdp-textarea { resize: vertical; min-height: 84px; }
                .pdp-field::placeholder, .pdp-textarea::placeholder { color: #c5bdb3; }
                .pdp-field:focus, .pdp-select:focus, .pdp-textarea:focus {
                    border-color: var(--pdp-gold); background: #fff;
                    box-shadow: 0 0 0 3px var(--pdp-gold-glow);
                }

                /* action card — only wraps qty/CTA/trust */
                .pdp-action-card {
                    background: #fff; border: 1px solid var(--pdp-border);
                    border-radius: 16px; padding: 22px;
                    box-shadow: var(--pdp-shadow); margin-top: 22px;
                }

                /* qty + CTA row */
                .pdp-btn-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
                .pdp-qty {
                    display:flex; align-items:center; height:46px;
                    border:1.5px solid var(--pdp-border); border-radius:10px;
                    overflow:hidden; background:#fff; flex-shrink:0;
                }
                .pdp-qty-btn {
                    width:40px; height:100%; display:flex; align-items:center; justify-content:center;
                    font-size:20px; font-weight:300; cursor:pointer; color:var(--pdp-muted);
                    background:transparent; border:none; transition:all .15s; line-height:1;
                }
                .pdp-qty-btn:hover { background:var(--pdp-warm); color:var(--pdp-ink); }
                .pdp-qty-val { width:44px; text-align:center; font-size:14px; font-weight:500; user-select:none; }

                /* cart button (identical to variable PDP) */
                .pdp-btn-cart {
                    position:relative; overflow:hidden;
                    flex:1; min-width:0; height:46px; border-radius:10px;
                    border:1.5px solid var(--pdp-ink); background:#fff;
                    color:var(--pdp-ink); font-size:13px; font-weight:500; letter-spacing:.4px;
                    cursor:pointer; padding:0 12px;
                    display:flex; align-items:center; justify-content:center; gap:6px;
                    white-space:nowrap; transition:border-color .2s, box-shadow .2s;
                }
                .pdp-btn-cart:hover:not(:disabled):not(.loading):not(.success) {
                    background:var(--pdp-ink); color:#fff; box-shadow:0 4px 18px rgba(28,24,18,.2);
                }
                .pdp-btn-cart:disabled { opacity:.45; cursor:not-allowed; }
                .pdp-btn-cart .pdp-ripple { position:absolute; border-radius:50%; background:rgba(28,24,18,.15); width:10px; height:10px; transform:scale(0); pointer-events:none; animation:pdpRipple .5s ease-out forwards; }
                @keyframes pdpRipple { to{transform:scale(28);opacity:0} }
                .pdp-btn-cart.loading { background:var(--pdp-warm); color:var(--pdp-muted); border-color:var(--pdp-border); cursor:not-allowed; }
                .pdp-btn-cart .pdp-cart-label { display:flex; align-items:center; gap:7px; transition:opacity .15s,transform .15s; }
                .pdp-btn-cart.loading .pdp-cart-label,.pdp-btn-cart.success .pdp-cart-label { opacity:0;transform:translateY(-8px); }
                .pdp-btn-cart .pdp-cart-loading { position:absolute; display:flex; gap:5px; align-items:center; opacity:0; transition:opacity .15s; }
                .pdp-btn-cart.loading .pdp-cart-loading { opacity:1; }
                .pdp-cart-dot { width:6px; height:6px; border-radius:50%; background:var(--pdp-muted); animation:pdpDotBounce .9s ease-in-out infinite; }
                .pdp-cart-dot:nth-child(2){animation-delay:.15s}.pdp-cart-dot:nth-child(3){animation-delay:.3s}
                @keyframes pdpDotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
                .pdp-btn-cart.success { background:var(--pdp-green); border-color:var(--pdp-green); color:#fff; animation:pdpBtnPop .35s cubic-bezier(.34,1.56,.64,1); }
                @keyframes pdpBtnPop{0%{transform:scale(1)}45%{transform:scale(.96)}100%{transform:scale(1)}}
                .pdp-btn-cart .pdp-cart-success { position:absolute; display:flex; align-items:center; gap:7px; opacity:0; transform:translateY(8px); transition:opacity .2s .05s,transform .2s .05s; font-size:13px; font-weight:500; }
                .pdp-btn-cart.success .pdp-cart-success { opacity:1; transform:translateY(0); }
                .pdp-check-svg  { width:16px; height:16px; }
                .pdp-check-path { stroke:#fff; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; fill:none; stroke-dasharray:20; stroke-dashoffset:20; }
                .pdp-btn-cart.success .pdp-check-path { animation:pdpDrawCheck .35s ease .1s forwards; }
                @keyframes pdpDrawCheck{to{stroke-dashoffset:0}}
                .pdp-cart-particles { position:absolute; inset:0; pointer-events:none; overflow:visible; }
                .pdp-particle { position:absolute; width:5px; height:5px; border-radius:50%; top:50%; left:50%; opacity:0; }
                .pdp-btn-cart.success .pdp-particle { animation:pdpParticle .6s ease-out forwards; }
                .pdp-particle:nth-child(1){background:#f59e0b;animation-delay:.05s;--dx:-38px;--dy:-28px}
                .pdp-particle:nth-child(2){background:#3a7a55;animation-delay:.07s;--dx:38px;--dy:-28px}
                .pdp-particle:nth-child(3){background:#b03030;animation-delay:.09s;--dx:-44px;--dy:2px}
                .pdp-particle:nth-child(4){background:#b8943a;animation-delay:.06s;--dx:44px;--dy:2px}
                .pdp-particle:nth-child(5){background:#3a7a55;animation-delay:.08s;--dx:-24px;--dy:30px}
                .pdp-particle:nth-child(6){background:#f59e0b;animation-delay:.10s;--dx:24px;--dy:30px}
                @keyframes pdpParticle{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0)}}

                .pdp-buynow-wrap { display:contents; }

                /* icon actions */
                .pdp-icon-row { display:flex; gap:20px; margin-top:14px; }
                .pdp-icon-btn {
                    display:flex; align-items:center; gap:6px; font-size:12px;
                    color:var(--pdp-muted); cursor:pointer; background:none; border:none;
                    padding:4px 0; transition:color .18s; font-family:inherit;
                }
                .pdp-icon-btn:hover { color:var(--pdp-ink); }
                .pdp-icon-btn.wishlisted { color:var(--pdp-red); }
                .pdp-icon-btn:disabled { opacity:.45; cursor:not-allowed; }

                /* trust strip */
                .pdp-trust { display:flex; gap:18px; flex-wrap:wrap; padding:14px 0 0; border-top:1px solid var(--pdp-border); margin-top:16px; }
                .pdp-trust-item { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--pdp-muted); }

                /* divider */
                .pdp-divider { display:flex; align-items:center; gap:14px; margin:48px 0; }
                .pdp-divider::before,.pdp-divider::after { content:''; flex:1; height:1px; background:var(--pdp-border); }
                .pdp-divider-gem { color:var(--pdp-gold); font-size:9px; flex-shrink:0; }

                /* ── Confirm drawer ── */
                .cpd-overlay {
                    position:fixed; inset:0; z-index:9999;
                    background:rgba(14,12,10,.65); backdrop-filter:blur(6px);
                    display:flex; align-items:flex-end; justify-content:center;
                    animation:cpdIn .2s ease both;
                }
                @keyframes cpdIn{from{opacity:0}to{opacity:1}}
                .cpd-drawer {
                    background:#fff; width:100%; max-height:88vh;
                    border-radius:20px 20px 0 0;
                    display:flex; flex-direction:column; overflow:hidden;
                    box-shadow:0 -16px 60px rgba(14,12,10,.22);
                    animation:cpdSlide .32s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes cpdSlide{from{transform:translateY(100%)}to{transform:none}}
                @media(min-width:600px){
                    .cpd-overlay{align-items:center;}
                    .cpd-drawer{max-width:480px;border-radius:20px;animation:cpdPop .32s cubic-bezier(.22,1,.36,1) both;}
                    @keyframes cpdPop{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
                }
                .cpd-drawer-hd {
                    display:flex; align-items:center; justify-content:space-between;
                    padding:20px 24px 16px; border-bottom:1px solid var(--pdp-border);
                    background:var(--pdp-cream); flex-shrink:0;
                }
                .cpd-eyebrow  { font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:var(--pdp-gold); margin:0 0 3px; }
                .cpd-title    { font-size:20px; font-weight:400; color:var(--pdp-ink); letter-spacing:-.02em; margin:0; }
                .cpd-x        { width:32px; height:32px; border-radius:50%; border:1px solid var(--pdp-border); background:#fff; font-size:20px; cursor:pointer; color:var(--pdp-muted); display:flex; align-items:center; justify-content:center; transition:all .15s; }
                .cpd-x:hover  { background:var(--pdp-warm); color:var(--pdp-ink); transform:rotate(90deg); }
                .cpd-drawer-bd { flex:1; overflow-y:auto; padding:20px 24px; scrollbar-width:thin; scrollbar-color:var(--pdp-border) transparent; }
                .cpd-product-row  { display:flex; gap:14px; margin-bottom:20px; }
                .cpd-thumb        { width:76px; height:76px; border-radius:12px; overflow:hidden; flex-shrink:0; border:1px solid var(--pdp-border); background:var(--pdp-warm); }
                .cpd-product-meta { display:flex; flex-direction:column; justify-content:center; }
                .cpd-product-name { font-size:15px; font-weight:500; color:var(--pdp-ink); margin:0 0 5px; }
                .cpd-product-qty  { font-size:12px; color:var(--pdp-muted); margin:0 0 3px; }
                .cpd-product-dress{ font-size:12.5px; color:var(--pdp-gold); font-weight:500; margin:0; }
                .cpd-inputs-summary { border-top:1px solid var(--pdp-border); padding-top:16px; }
                .cpd-summary-lbl  { font-size:9px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; color:var(--pdp-muted); margin:0 0 12px; }
                .cpd-summary-row  { display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-bottom:1px solid var(--pdp-border); font-size:12.5px; }
                .cpd-summary-row:last-child { border-bottom:none; }
                .cpd-summary-key  { color:var(--pdp-muted); flex-shrink:0; }
                .cpd-summary-val  { color:var(--pdp-ink); font-weight:500; text-align:right; }
                .cpd-drawer-ft  { display:flex; gap:10px; padding:16px 24px; border-top:1px solid var(--pdp-border); background:var(--pdp-cream); flex-shrink:0; }
                .cpd-btn-ghost  { padding:11px 18px; border:1.5px solid var(--pdp-border); border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; background:#fff; color:var(--pdp-ink); transition:all .15s; font-family:inherit; }
                .cpd-btn-ghost:hover { background:var(--pdp-warm); }
                .cpd-btn-dark   { flex:1; padding:11px 18px; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; background:var(--pdp-ink); color:#fff; transition:all .18s; letter-spacing:.3px; font-family:inherit; }
                .cpd-btn-dark:hover { background:#2d2820; box-shadow:0 4px 18px rgba(28,24,18,.22); transform:translateY(-1px); }

                /* responsive */
                @media(max-width:480px){
                    .pdp-btn-row { flex-direction:column; gap:8px; }
                    .pdp-qty     { width:100%; }
                    .pdp-btn-cart { width:100%; font-size:14px; height:48px; padding:0 16px; }
                    .pdp-buynow-wrap { display:block; width:100%; }
                    .pdp-buynow-wrap > * { width:100% !important; height:48px !important; padding:0 16px !important; box-sizing:border-box; }
                }
            `}</style>

            <div className="pdp-root">
                <div className="md:py-[30px] max-w-[1200px] mx-auto">

                    {/* ── Two-column layout ── */}
                    <div className="pdp-top-grid">

                        {/* Gallery — wider column so images render larger */}
                        <div className="pdp-fade-up pdp-gallery-col">
                            <Suspense fallback={<div className="pdp-skeleton" style={{ height: 600, borderRadius: 16 }} />}>
                                <ProductGallery
                                    featuredImage={featuredImage}
                                    setFeaturedImage={setFeaturedImage}
                                    galleryImages={galleryImages}
                                />
                            </Suspense>
                        </div>

                        {/* Info column */}
                        <div style={{ padding: "0 10px" }}>

                            {/* Brand + name + tag */}
                            <div className="pdp-fade-up pdp-d1">
                                <span className="pdp-brand-pill">{product.brand || "Custom"}</span>
                                <h1 className="pdp-name">{product.name}</h1>
                                <span className="pdp-mto-tag">✦ Made-to-Order</span>
                            </div>

                            {/* Rating */}
                            <div className="pdp-rating-row pdp-fade-up pdp-d2">
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

                            {/* Price */}
                            <div className="pdp-price-block pdp-fade-up pdp-d2">
                                <span className="pdp-price-main">₹{activePrice}</span>
                                {showStrike && <span className="pdp-price-strike">₹{product.regularPrice}</span>}
                                {discountPct > 0 && <span className="pdp-price-badge">{discountPct}% off</span>}
                            </div>

                            {/* ─ Dress types — NO white card, page background shows through ─ */}
                            {dressTypes.length > 0 && (
                                <div className="pdp-fade-up pdp-d3">
                                    <p className="pdp-out-hd">Select Dress Type</p>
                                    <div className="pdp-dt-grid">
                                        {dressTypes.map((dt, i) => (
                                            <button
                                                key={i}
                                                className={`pdp-dt-btn${selectedDressType?.label === dt.label ? " active" : ""}`}
                                                onClick={() => handleDressType(dt.label)}
                                            >
                                                <span className="pdp-dt-label">{dt.label}</span>
                                                <span className="pdp-dt-price">₹{dt.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─ Image upload — only renders when truthy (!! prevents 0 render) ─ */}
                            {!!product.allowCustomerImageUpload && (
                                <div className="pdp-fade-up pdp-d3">
                                    <p className="pdp-out-hd">
                                        Upload Your Image
                                        <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, fontSize: 9, marginLeft: 4 }}>(optional)</span>
                                    </p>
                                    {customerUploadedImage ? (
                                        <div className="pdp-uploaded-wrap">
                                            <img src={customerUploadedImage} alt="Uploaded" className="pdp-uploaded-img" />
                                            <div className="pdp-upload-actions">
                                                <button
                                                    className="pdp-upload-btn remove"
                                                    onClick={() => {
                                                        setCustomerUploadedImage(null);
                                                        const fi = document.getElementById("cpd-file");
                                                        if (fi) fi.value = "";
                                                    }}
                                                >Remove</button>
                                                <label htmlFor="cpd-file" className="pdp-upload-btn change" style={{ cursor: "pointer" }}>Change</label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label htmlFor="cpd-file" className="pdp-upload-zone">
                                            <div className="pdp-upload-icon">🖼️</div>
                                            <p className="pdp-upload-text">{uploadingImage ? "Uploading…" : "Click to upload an image"}</p>
                                            <p className="pdp-upload-sub">PNG, JPG, GIF · max 5MB</p>
                                        </label>
                                    )}
                                    <input id="cpd-file" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} style={{ display: "none" }} />
                                </div>
                            )}

                            {/* ─ Custom inputs — NO white card ─ */}
                            {customInputs.length > 0 && (
                                <div className="pdp-fade-up pdp-d3">
                                    <p className="pdp-out-hd">Customise Your Product</p>
                                    {customInputs.map((inp, idx) => (
                                        <div className="pdp-input-block" key={inp.id || idx}>
                                            <label className="pdp-input-lbl">
                                                {inp.label}{inp.required && <em>*</em>}
                                            </label>
                                            {inp.type === "select" ? (
                                                <select className="pdp-select" value={customInputValues[inp.id] || ""} onChange={e => handleInputChange(inp.id, e.target.value)} required={inp.required}>
                                                    <option value="">{inp.placeholder || `Select ${inp.label}`}</option>
                                                    {(inp.options || []).map((o, oi) => <option key={oi} value={o}>{o}</option>)}
                                                </select>
                                            ) : inp.type === "textarea" ? (
                                                <textarea className="pdp-textarea" value={customInputValues[inp.id] || ""} onChange={e => handleInputChange(inp.id, e.target.value)} placeholder={inp.placeholder || `Enter ${inp.label}`} rows={3} required={inp.required} />
                                            ) : (
                                                <input type={["number", "email", "tel"].includes(inp.type) ? inp.type : "text"} className="pdp-field" value={customInputValues[inp.id] || ""} onChange={e => handleInputChange(inp.id, e.target.value)} placeholder={inp.placeholder || `Enter ${inp.label}`} required={inp.required} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ─ Action card — ONLY qty + CTAs + wishlist + trust ─ */}
                            <div className="pdp-action-card pdp-fade-up pdp-d4">
                                <div className="pdp-btn-row">
                                    <div className="pdp-qty">
                                        <button className="pdp-qty-btn" onClick={handleDecrement}>−</button>
                                        <span className="pdp-qty-val">{count.toString().padStart(2, "0")}</span>
                                        <button className="pdp-qty-btn" onClick={handleIncrement}>+</button>
                                    </div>

                                    <button
                                        ref={cartBtnRef}
                                        className={`pdp-btn-cart${addingToCart ? " loading" : ""}${cartSuccess ? " success" : ""}`}
                                        onClick={e => {
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
                                            handleAddToCartClick();
                                        }}
                                        disabled={addingToCart || cartSuccess}
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
                                            product={product}
                                            productType="customproduct"
                                            customInputs={customInputValues}
                                            selectedDressType={selectedDressType}
                                            quantity={count}
                                            disabled={false}
                                            brandID={product?.brandID}
                                        />
                                    </div>
                                </div>

                                <div className="pdp-icon-row">
                                    <button
                                        className={`pdp-icon-btn${isWishlisted ? " wishlisted" : ""}`}
                                        onClick={() => productID && toggleWishlist(productID)}
                                        disabled={wishlistLoading}
                                    >
                                        {isWishlisted ? <FaHeart size={13} /> : <CiHeart size={15} />}
                                        {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                                    </button>
                                    {product?.sizeChartUrl && (
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

                            {/* Tabs */}
                            <div className="pdp-fade-up pdp-d5" style={{ marginTop: 20 }}>
                                <Suspense fallback={<div className="pdp-skeleton" style={{ height: 120, borderRadius: 12 }} />}>
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

                    {/* ── Randomised sections + reviews ── */}
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
                            {sectionsBelow.map(section => (
                                <div key={section.id}>
                                    <Divider />
                                    <SectionBlock section={section} />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Confirm drawer */}
            <ConfirmDrawer
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                product={product}
                count={count}
                customInputs={customInputs}
                customInputValues={customInputValues}
                selectedDressType={selectedDressType}
                isBuyNow={isBuyNow}
                onConfirm={addToCart}
            />

            {/* Cross-sell modal */}
            <Suspense fallback={null}>
                <CrossSellModal
                    isOpen={showCrossSell}
                    onClose={() => setShowCrossSell(false)}
                    products={crossSellProducts}
                    loading={false}
                />
            </Suspense>
            {/* Size Chart Modal */}
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
        </>
    );
};

export default CustomProductDetail;