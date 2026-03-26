"use client";
import axios from "axios";
import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BsFillStarFill, BsStar } from "react-icons/bs";
import { toast } from "react-toastify";
import { CiHeart, CiRuler } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addCartAsync } from "@/redux/slices/cartSlice";
import { useWishlist } from "@/contexts/WishlistContext";
import Loading from "@/components/ui/loading";
import CountdownTimer from "@/components/products/CountdownTimer";
import CrossSellModal from "@/components/products/crossSellModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BuyNowButton from "@/components/BuyNowButton";

const ProductGallery = lazy(() => import("@/components/products/productGallery"));
const ProductTabs = lazy(() => import("@/components/products/tabsAccordion"));
const ProductSection = lazy(() => import("@/components/home/ProductSection"));
const Reviews = lazy(() => import("@/components/products/reviews"));

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

const toAttributeArray = (variationValues) => {
    try {
        let vals = variationValues;
        if (typeof vals === "string") vals = JSON.parse(vals);
        if (vals && !Array.isArray(vals) && typeof vals === "object")
            return Object.entries(vals).map(([k, v]) => ({ [k]: v }));
        return Array.isArray(vals) ? vals : [];
    } catch { return []; }
};

async function fetchProducts({ limit = 20, page = 1, categoryID = "", type = "variable", sectionid = "" } = {}) {
    const params = new URLSearchParams();
    params.append("limit", String(limit));
    params.append("page", String(page));
    if (categoryID) params.append("categoryID", categoryID);
    if (type) params.append("type", type);
    if (sectionid) params.append("sectionid", sectionid);
    const res = await fetch(`https://backend.ithyaraa.com/api/products/all-products?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    const parsedProducts = (data?.data || []).map((p) => {
        const parsed = { ...p };
        ["galleryImage", "featuredImage", "categories"].forEach((f) => { if (f in parsed) parsed[f] = safeParse(parsed[f]); });
        return parsed;
    });
    return { count: data.count, data: parsedProducts };
}

const buildOfferText = (offer) => {
    if (!offer) return null;
    const { offerType, offerName, buyCount, getCount } = offer;
    const type = String(offerType || "").toLowerCase();
    if (type === "buy_x_get_y" || type === "bogo") {
        if (buyCount === 1 && getCount === 1) return { headline: "Buy 1 Get 1 FREE", action: "Add 2 to cart" };
        if (buyCount === 2 && getCount === 1) return { headline: "Buy 2 Get 1 FREE", action: `Add ${buyCount + getCount} to cart` };
        return { headline: `Buy ${buyCount} Get ${getCount} FREE`, action: `Add ${buyCount + getCount} to cart` };
    }
    return { headline: offerName || "Special Offer", action: "Add to cart to unlock" };
};

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

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetail = () => {
    const { productID } = useParams();
    const searchParams = useSearchParams();
    const referBy = searchParams.get("referBy");

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
    const [productQuantity, setProductQuantity] = useState(100);
    const [showCrossSellModal, setShowCrossSellModal] = useState(false);
    const [crossSellProducts, setCrossSellProducts] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        totalReviews: 0, averageRating: 0,
        ratingBreakdown: [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: 0 })),
    });
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [sections, setSections] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const cartBtnRef = useRef(null);

    const dispatch = useDispatch();
    const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
    const isWishlisted = productID ? isInWishlist(productID) : false;

    // ── Fetch product ─────────────────────────────────────────────────────────
    const fetchedRef = useRef(null);
    useEffect(() => {
        if (!productID || fetchedRef.current === productID) return;
        fetchedRef.current = productID;
        const load = async () => {
            try {
                const res = await axios.get(`https://backend.ithyaraa.com/api/products/details/${productID}`);
                let data = res.data.product;
                ["galleryImage", "featuredImage", "categories", "productAttributes"].forEach((f) => { if (f in data) data[f] = safeParse(data[f]); });
                setFeaturedImage(data.featuredImage?.[0]?.imgUrl || "");
                setGalleryImages(data.galleryImage || []);
                setProduct(data);
                setVariationPrice(data.regularPrice);
                setVariationSalePrice(data.salePrice);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [productID]);

    // ── Fetch review stats ────────────────────────────────────────────────────
    const reviewsFetchedRef = useRef(null);
    useEffect(() => {
        if (!productID || reviewsFetchedRef.current === productID) return;
        reviewsFetchedRef.current = productID;
        axios.get(`https://backend.ithyaraa.com/api/reviews/product/${productID}/stats`)
            .then((res) => { if (res.data.success) setReviewStats(res.data.data); })
            .catch(console.error);
    }, [productID]);

    // ── Build attributes ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!product?.variations) return;
        const map = {};
        product.variations.forEach((v) => {
            toAttributeArray(v.variationValues).forEach((obj) => {
                const [k, val] = Object.entries(obj)[0];
                if (!map[k]) map[k] = new Set();
                map[k].add(val);
            });
        });
        setAttributes(Object.entries(map).map(([name, s]) => ({ name, values: Array.from(s) })));
    }, [product]);

    useEffect(() => { setIsMounted(true); }, []);

    // ── Fetch sections (unique IDs, max 3) ───────────────────────────────────
    const sectionsFetchedRef = useRef(false);
    useEffect(() => {
        if (sectionsFetchedRef.current) return;
        sectionsFetchedRef.current = true;
        (async () => {
            try {
                const shuffled = [...SECTION_POOL].sort(() => Math.random() - 0.5);
                const results = []; const seen = new Set();
                for (const id of shuffled) {
                    if (results.length >= 3 || seen.has(id)) continue;
                    seen.add(id);
                    try {
                        const data = await fetchProducts({ sectionid: id, limit: 12 });
                        if (data.data.length > 0) results.push({ id, products: data.data, ...SECTION_META[id] });
                    } catch { }
                }
                setSections(results);
            } catch { }
        })();
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleIncrement = () => {
        if (!selectedVariation) { toast.error("Select a variation first"); return; }
        if (count < productQuantity) setCount((p) => p + 1);
    };
    const handleDecrement = () => {
        if (!selectedVariation) { toast.error("Select a variation first"); return; }
        if (count > 1) setCount((p) => p - 1);
    };

    const handleSelectAttribute = (attrName, value) => {
        const newSelected = { ...selectedAttributes, [attrName]: value };
        setSelectedAttributes(newSelected);
        if (!product?.variations) return;
        const match = product.variations.find((v) =>
            toAttributeArray(v.variationValues).every((obj) => {
                const [k, val] = Object.entries(obj)[0];
                return newSelected[k] === val;
            })
        );
        setSelectedVariation(match || null);
        setVariationPrice(match ? match.variationPrice : product.regularPrice);
        setVariationSalePrice(match ? match.variationSalePrice : product.salePrice);
        const stock = match ? match.variationStock : 0;
        setProductQuantity(stock);
        setCount(stock > 0 ? 1 : 0);
    };

    const addToCart = async () => {
        if (!selectedVariation || selectedVariation.variationStock === 0) {
            toast.error("Please select a valid variation."); return;
        }
        setAddingToCart(true);
        try {
            const cartResult = await dispatch(addCartAsync({
                productID, referBy, quantity: count,
                variationID: selectedVariation.variationID,
                variationName: selectedVariation.variationName,
            })).unwrap();
            if (cartResult && cartResult.success !== false) {
                setAddingToCart(false);
                setCartSuccess(true);
                setTimeout(() => setCartSuccess(false), 2000);
                toast.success("Added to cart!");
                if (Array.isArray(cartResult.crossSellProducts) && cartResult.crossSellProducts.length > 0) {
                    setCrossSellProducts(cartResult.crossSellProducts);
                    setShowCrossSellModal(true);
                }
            } else {
                toast.error("Failed to add to cart.");
                setAddingToCart(false);
            }
        } catch {
            toast.error("Failed to add to cart.");
            setAddingToCart(false);
        }
    };

    // ── Early returns ─────────────────────────────────────────────────────────
    if (loading) return <Loading />;
    if (!product) return <p style={{ textAlign: "center", marginTop: 40 }}>Product not found</p>;

    // ── Derived pricing ───────────────────────────────────────────────────────
    const effectiveVariation = selectedVariation || null;
    const effectiveRegularPrice = effectiveVariation?.variationPrice ?? variationPrice ?? product.regularPrice;
    const effectiveDisplayPrice = effectiveVariation?.variationSalePrice ?? variationSalePrice ?? product.salePrice ?? effectiveRegularPrice;

    let flashDisplayPrice = effectiveDisplayPrice;
    if (product.isFlashSale && !effectiveVariation && product.regularPrice != null) {
        const base = Number(product.regularPrice), dval = Number(product.discountValue || 0);
        const dtype = String(product.discountType || "").toLowerCase();
        if (!Number.isNaN(base) && dval > 0)
            flashDisplayPrice = dtype === "percentage"
                ? Math.max(0, +(base * (1 - dval / 100)).toFixed(2))
                : Math.max(0, +(base - dval).toFixed(2));
    }

    const previousSalePrice = product.salePrice && product.salePrice !== product.regularPrice ? product.salePrice : null;
    const offerText = buildOfferText(product?.offer);
    const isOutOfStock = !selectedVariation || selectedVariation.variationStock <= 0 || count > (selectedVariation.variationStock || 0);

    const discountPct = (() => {
        const reg = Number(effectiveRegularPrice);
        const disp = Number(product.isFlashSale ? flashDisplayPrice : effectiveDisplayPrice);
        if (reg > 0 && disp < reg) return Math.round((1 - disp / reg) * 100);
        return product.discountValue ? Number(product.discountValue) : 0;
    })();

    const sectionAbove = sections[0] ?? null;
    const sectionsBelow = sections.slice(1);

    return (
        <>
            {/* ── Global styles ── */}
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
                    background: var(--pdp-cream);
                    min-height: 100vh;
                    color: var(--pdp-ink);
                }

                /* ── Shimmer skeleton ── */
                .pdp-skeleton {
                    background: linear-gradient(90deg,#ede8df 25%,#f5f1ea 50%,#ede8df 75%);
                    background-size: 200% 100%;
                    animation: pdpShimmer 1.5s ease-in-out infinite;
                }
                @keyframes pdpShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

                /* ── Entrance animations ── */
                .pdp-fade-up          { animation: pdpFadeUp .65s cubic-bezier(.22,1,.36,1) both; }
                .pdp-fade-up-d1       { animation-delay:.08s }
                .pdp-fade-up-d2       { animation-delay:.16s }
                .pdp-fade-up-d3       { animation-delay:.24s }
                .pdp-fade-up-d4       { animation-delay:.32s }
                .pdp-fade-up-d5       { animation-delay:.42s }
                @keyframes pdpFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }

                .pdp-gallery-col {
                    position: sticky;
                    top: 20px;
                    align-self: start;
                }

                /* ── Brand pill ── */
                .pdp-brand-pill {
                    display: inline-block;
                    font-size: 9.5px; font-weight: 500; letter-spacing: 2.8px;
                    text-transform: uppercase; color: var(--pdp-gold);
                    border: 1px solid var(--pdp-gold-lt);
                    background: linear-gradient(135deg,rgba(184,148,58,.06),rgba(184,148,58,.13));
                    padding: 4px 14px; border-radius: 99px; margin-bottom: 12px;
                }

                /* ── Product name ── */
                .pdp-name {
                    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
                    font-weight: 400; line-height: 1.12;
                    color: var(--pdp-ink); letter-spacing: -.02em; margin: 0;
                }

                /* ── Rating row ── */
                .pdp-rating-row { display:flex; align-items:center; gap:10px; margin-top:12px; flex-wrap:wrap; }
                .pdp-stars { display:flex; gap:3px; }
                .pdp-star  { font-size:11px; }
                .pdp-star.on  { color: var(--pdp-gold); }
                .pdp-star.off { color: var(--pdp-border); }
                .pdp-rating-num { font-size:12px; font-weight:500; color:var(--pdp-gold); }
                .pdp-sep { width:1px; height:11px; background:var(--pdp-border); }
                .pdp-review-ct { font-size:12px; color:var(--pdp-muted); }

                /* ── Stock badge ── */
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

                /* ── Price block ── */
                .pdp-price-block { display:flex; align-items:baseline; gap:12px; margin-top:20px; flex-wrap:wrap; }
                .pdp-price-main {
                    font-size: 2.2rem; font-weight: 600; color: var(--pdp-ink); line-height:1;
                }
                .pdp-price-main.flash { color: var(--pdp-red); }
                .pdp-price-strike     { font-size: 1.05rem; color: var(--pdp-muted); text-decoration: line-through; }
                .pdp-price-badge      {
                    font-size: 10px; font-weight: 600; letter-spacing: .6px; text-transform:uppercase;
                    color: #fff; background: var(--pdp-green);
                    padding: 3px 10px; border-radius: 99px;
                }

                /* ── Flash sale strip ── */
                .pdp-flash-strip {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(176,48,48,.07); border: 1px solid rgba(176,48,48,.18);
                    border-radius: 8px; padding: 6px 13px; margin-top: 8px;
                    font-size: 11.5px; color: var(--pdp-red); font-weight: 500; letter-spacing: .3px;
                }

                /* ── Offer banner ── */
                .pdp-offer {
                    border-radius: 12px; overflow: hidden;
                    border: 1.5px solid rgba(184,148,58,.38);
                    background: linear-gradient(135deg,#fffbeb,#fef3c7,#fde68a,#fef3c7,#fffbeb);
                    background-size: 300% 300%;
                    animation: pdpOfferIn .5s cubic-bezier(.22,1,.36,1) both, pdpOscBg 4s ease infinite;
                    clip-path: inset(0 100% 0 0 round 12px);
                    margin-top: 18px;
                }
                @keyframes pdpOfferIn { 0%{clip-path:inset(0 100% 0 0 round 12px)} 60%{clip-path:inset(0 0% 0 0 round 12px)} 78%{clip-path:inset(0 -2% 0 0 round 12px)} 100%{clip-path:inset(0 0% 0 0 round 12px)} }
                @keyframes pdpOscBg   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
                .pdp-offer-body { padding: 12px 14px 9px; }
                .pdp-offer-row  { display:flex; align-items:center; gap:10px; margin-bottom:5px; }
                .pdp-offer-fire { font-size:20px; animation:pdpFireShake 1.6s ease-in-out .7s infinite; display:inline-block; }
                @keyframes pdpFireShake { 0%,100%{transform:rotate(0) scale(1)} 25%{transform:rotate(-8deg) scale(1.1)} 75%{transform:rotate(8deg) scale(1.1)} }
                .pdp-offer-texts { flex:1; }
                .pdp-offer-eyebrow {
                    font-size: 9px; font-weight: 700; letter-spacing: 2.2px;
                    color: #b45309; text-transform: uppercase; margin: 0;
                }
                .pdp-offer-headline {
                    font-size: 19px; font-weight: 700; color: #92400e; margin: 0; line-height: 1.1;
                }
                .pdp-offer-pill {
                    font-size: 10px; font-weight: 700; color: #78350f;
                    background: rgba(217,119,6,.14); border: 1.5px solid rgba(217,119,6,.3);
                    border-radius: 99px; padding: 3px 10px; white-space: nowrap;
                }
                .pdp-offer-sub  { font-size: 10.5px; color: #b45309; margin: 0; font-style: italic; }
                .pdp-offer-sub strong { color: #92400e; font-style: normal; font-weight: 700; }
                .pdp-offer-bar  { height: 3px; background: rgba(245,158,11,.13); overflow: hidden; }
                .pdp-offer-fill { height:100%; width:45%; background:linear-gradient(90deg,transparent,#f59e0b,#fbbf24,#f59e0b,transparent); animation:pdpBarSweep 1.8s ease-in-out infinite; }
                @keyframes pdpBarSweep { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }

                /* ── Info card ── */
                .pdp-card {
                    // background: #fff;
                    // border: 1px solid var(--pdp-border);
                    // border-radius: 16px;
                    // padding: 22px;
                    // box-shadow: var(--pdp-shadow);
                    margin-top: 22px;
                }

                /* ── Attribute section ── */
                .pdp-attr-label {
                    font-size: 9.5px; font-weight: 500; letter-spacing: 2.5px;
                    text-transform: uppercase; color: var(--pdp-muted);
                    display: block; margin-bottom: 12px;
                }
                .pdp-attr-block { margin-bottom: 16px; }
                .pdp-attr-name  { font-size: 11px; font-weight: 500; letter-spacing: 1.2px; text-transform:uppercase; color:var(--pdp-muted); margin-bottom: 8px; }
                .pdp-attr-vals  { display: flex; flex-wrap: wrap; gap: 8px; }

                .pdp-size-btn {
                    padding: 7px 17px; border-radius: 8px;
                    font-size: 13px; font-weight: 400; letter-spacing: .2px;
                    border: 1.5px solid var(--pdp-border); background: #fff;
                    color: var(--pdp-ink); cursor: pointer; transition: all .18s ease;
                }
                .pdp-size-btn:hover  { border-color: var(--pdp-ink); }
                .pdp-size-btn.active { background: var(--pdp-ink); color: #fff; border-color: var(--pdp-ink); box-shadow: 0 4px 14px rgba(28,24,18,.18); }

                .pdp-color-btn {
                    width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
                    border: 2px solid transparent; transition: all .18s ease;
                }
                .pdp-color-btn:hover  { transform: scale(1.1); }
                .pdp-color-btn.active { box-shadow: 0 0 0 2.5px #fff, 0 0 0 5px var(--pdp-ink); }

                /* ── Quantity stepper ── */
                .pdp-qty {
                    display: flex; align-items: center; height: 46px;
                    border: 1.5px solid var(--pdp-border); border-radius: 10px;
                    overflow: hidden; background: #fff; flex-shrink: 0;
                }
                .pdp-qty-btn {
                    width: 40px; height: 100%; display: flex; align-items: center; justify-content: center;
                    font-size: 20px; font-weight: 300; cursor: pointer; color: var(--pdp-muted);
                    background: transparent; border: none; transition: all .15s;
                    line-height: 1;
                }
                .pdp-qty-btn:hover { background: var(--pdp-warm); color: var(--pdp-ink); }
                .pdp-qty-val { width: 44px; text-align: center; font-size: 14px; font-weight: 500; color: var(--pdp-ink); user-select: none; }

                /* ── CTA buttons ── */
                .pdp-btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

                .pdp-btn-cart {
                    position: relative; overflow: hidden;
                    flex: 1; min-width: 0; height: 46px; border-radius: 10px;
                    border: 1.5px solid var(--pdp-ink); background: #fff;
                    color: var(--pdp-ink); font-size: 13px; font-weight: 500; letter-spacing: .4px;
                    cursor: pointer; transition: border-color .2s ease, box-shadow .2s ease; padding: 0 12px;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    white-space: nowrap;
                }
                .pdp-btn-cart:hover:not(:disabled):not(.loading):not(.success) {
                    background: var(--pdp-ink); color: #fff; box-shadow: 0 4px 18px rgba(28,24,18,.2);
                }
                .pdp-btn-cart:disabled { opacity: .45; cursor: not-allowed; }

                /* ripple */
                .pdp-btn-cart .pdp-ripple {
                    position: absolute; border-radius: 50%;
                    background: rgba(28,24,18,.15);
                    width: 10px; height: 10px;
                    transform: scale(0); pointer-events: none;
                    animation: pdpRipple .5s ease-out forwards;
                }
                @keyframes pdpRipple {
                    to { transform: scale(28); opacity: 0; }
                }

                /* loading state */
                .pdp-btn-cart.loading {
                    background: var(--pdp-warm); color: var(--pdp-muted);
                    border-color: var(--pdp-border); cursor: not-allowed;
                }

                /* label inside button */
                .pdp-btn-cart .pdp-cart-label {
                    display: flex; align-items: center; justify-content: center; gap: 7px;
                    transition: opacity .15s, transform .15s;
                }
                .pdp-btn-cart.loading .pdp-cart-label,
                .pdp-btn-cart.success .pdp-cart-label { opacity: 0; transform: translateY(-8px); }

                /* loading dots */
                .pdp-btn-cart .pdp-cart-loading {
                    position: absolute; display: flex; gap: 5px; align-items: center;
                    opacity: 0; transition: opacity .15s;
                }
                .pdp-btn-cart.loading .pdp-cart-loading { opacity: 1; }
                .pdp-cart-dot {
                    width: 6px; height: 6px; border-radius: 50%; background: var(--pdp-muted);
                    animation: pdpDotBounce .9s ease-in-out infinite;
                }
                .pdp-cart-dot:nth-child(2) { animation-delay: .15s; }
                .pdp-cart-dot:nth-child(3) { animation-delay: .3s; }
                @keyframes pdpDotBounce {
                    0%,80%,100% { transform: translateY(0); }
                    40%         { transform: translateY(-6px); }
                }

                /* success state */
                .pdp-btn-cart.success {
                    background: var(--pdp-green); border-color: var(--pdp-green); color: #fff;
                    animation: pdpBtnPop .35s cubic-bezier(.34,1.56,.64,1);
                }
                @keyframes pdpBtnPop {
                    0%   { transform: scale(1); }
                    45%  { transform: scale(.96); }
                    100% { transform: scale(1); }
                }

                /* success checkmark */
                .pdp-btn-cart .pdp-cart-success {
                    position: absolute; display: flex; align-items: center; gap: 7px;
                    opacity: 0; transform: translateY(8px);
                    transition: opacity .2s .05s, transform .2s .05s;
                    font-size: 13px; font-weight: 500;
                }
                .pdp-btn-cart.success .pdp-cart-success {
                    opacity: 1; transform: translateY(0);
                }
                .pdp-check-svg { width: 16px; height: 16px; }
                .pdp-check-path {
                    stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
                    fill: none; stroke-dasharray: 20; stroke-dashoffset: 20;
                }
                .pdp-btn-cart.success .pdp-check-path {
                    animation: pdpDrawCheck .35s ease .1s forwards;
                }
                @keyframes pdpDrawCheck { to { stroke-dashoffset: 0; } }

                /* particle burst */
                .pdp-cart-particles {
                    position: absolute; inset: 0; pointer-events: none; overflow: visible;
                }
                .pdp-particle {
                    position: absolute; width: 5px; height: 5px; border-radius: 50%;
                    top: 50%; left: 50%;
                    opacity: 0;
                }
                .pdp-btn-cart.success .pdp-particle { animation: pdpParticle .6s ease-out forwards; }
                .pdp-particle:nth-child(1)  { background:#f59e0b; animation-delay:.05s; --dx:-38px; --dy:-28px; }
                .pdp-particle:nth-child(2)  { background:#3a7a55; animation-delay:.07s; --dx: 38px; --dy:-28px; }
                .pdp-particle:nth-child(3)  { background:#b03030; animation-delay:.09s; --dx:-44px; --dy:  2px; }
                .pdp-particle:nth-child(4)  { background:#b8943a; animation-delay:.06s; --dx: 44px; --dy:  2px; }
                .pdp-particle:nth-child(5)  { background:#3a7a55; animation-delay:.08s; --dx:-24px; --dy: 30px; }
                .pdp-particle:nth-child(6)  { background:#f59e0b; animation-delay:.10s; --dx: 24px; --dy: 30px; }
                @keyframes pdpParticle {
                    0%   { opacity:1; transform:translate(0,0) scale(1); }
                    100% { opacity:0; transform:translate(var(--dx),var(--dy)) scale(0); }
                }

                .pdp-buynow-wrap { display: contents; }

                @media (max-width: 480px) {
                    .pdp-btn-row  { flex-direction: column; gap: 8px; }
                    .pdp-qty      { width: 100%; }
                    .pdp-qty-btn  { flex: 1; }
                    .pdp-qty-val  { flex: 1; }
                    .pdp-btn-cart { width: 100%; font-size: 14px; height: 48px; padding: 0 16px; }
                    .pdp-buynow-wrap { display: block; width: 100%; }
                    .pdp-buynow-wrap > * { width: 100% !important; height: 48px !important; padding: 0 16px !important; box-sizing: border-box; }
                }

                @media (max-width: 880px) {
                    .pdp-gallery-col { position: relative; top: 0; }
                }

                /* ── Icon actions (wishlist, size guide) ── */
                .pdp-icon-actions { display: flex; gap: 20px; margin-top: 14px; }
                .pdp-icon-btn {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 12px; color: var(--pdp-muted); cursor: pointer;
                    background: none; border: none; padding: 4px 0; transition: color .18s;
                }
                .pdp-icon-btn:hover  { color: var(--pdp-ink); }
                .pdp-icon-btn.w-on   { color: var(--pdp-red); }
                .pdp-icon-btn:disabled { opacity: .45; cursor: not-allowed; }

                /* ── Trust strip ── */
                .pdp-trust {
                    display: flex; gap: 18px; flex-wrap: wrap;
                    padding: 14px 0 0; border-top: 1px solid var(--pdp-border); margin-top: 16px;
                }
                .pdp-trust-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--pdp-muted); }

                /* ── Decorative divider ── */
                .pdp-divider { display:flex; align-items:center; gap:14px; margin: 48px 0; }
                .pdp-divider::before, .pdp-divider::after { content:''; flex:1; height:1px; background:var(--pdp-border); }
                .pdp-divider-gem { color: var(--pdp-gold); font-size: 9px; flex-shrink:0; }

            `}</style>

            <div className="pdp-root">
                <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 20px 72px" }}>

                    {/* ── Top grid: gallery + info ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "start" }}>

                        {/* Gallery */}
                        <div className="pdp-fade-up pdp-gallery-col">
                            <Suspense fallback={<div className="pdp-skeleton" style={{ height: 520, borderRadius: 16 }} />}>
                                <ProductGallery
                                    featuredImage={featuredImage}
                                    setFeaturedImage={setFeaturedImage}
                                    galleryImages={galleryImages}
                                />
                            </Suspense>
                        </div>

                        {/* Info column */}
                        <div>
                            {/* Brand + title */}
                            <div className="pdp-fade-up pdp-fade-up-d1">
                                <span className="pdp-brand-pill">{product.brand || "Brand"}</span>
                                <h1 className="pdp-name">{product.name}</h1>
                            </div>

                            {/* Rating row */}
                            <div className="pdp-rating-row pdp-fade-up pdp-fade-up-d2">
                                <div className="pdp-stars">
                                    {[1, 2, 3, 4, 5].map((s) => (
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
                                {selectedVariation && (
                                    <span className={`pdp-stock ${selectedVariation.variationStock > 0 ? "in" : "out"}`}>
                                        <span className="pdp-stock-dot" />
                                        {selectedVariation.variationStock > 0 ? "In Stock" : "Out of Stock"}
                                    </span>
                                )}
                            </div>

                            {/* Price block */}
                            <div className="pdp-price-block pdp-fade-up pdp-fade-up-d2">
                                {product.isFlashSale && previousSalePrice ? (
                                    <>
                                        <span className="pdp-price-main flash">₹{flashDisplayPrice}</span>
                                        <span className="pdp-price-strike">₹{previousSalePrice}</span>
                                        {effectiveRegularPrice && effectiveRegularPrice !== previousSalePrice && (
                                            <span className="pdp-price-strike">₹{effectiveRegularPrice}</span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span className="pdp-price-main">₹{variationSalePrice || variationPrice}</span>
                                        {variationSalePrice && variationSalePrice !== variationPrice && (
                                            <span className="pdp-price-strike">₹{variationPrice}</span>
                                        )}
                                    </>
                                )}
                                {discountPct > 0 && (
                                    <span className="pdp-price-badge">{discountPct}% off</span>
                                )}
                            </div>

                            {/* Flash countdown */}
                            {product.isFlashSale && (
                                <div className="pdp-flash-strip pdp-fade-up pdp-fade-up-d3">
                                    ⏳ Sale ends in <CountdownTimer endTime={product.flashSaleEndTime} />
                                </div>
                            )}

                            {/* Offer banner */}
                            {product?.offer && offerText && (
                                <div className="pdp-offer pdp-fade-up pdp-fade-up-d3">
                                    <div className="pdp-offer-body">
                                        <div className="pdp-offer-row">
                                            <span className="pdp-offer-fire">🔥</span>
                                            <div className="pdp-offer-texts">
                                                <p className="pdp-offer-eyebrow">Limited Offer</p>
                                                <p className="pdp-offer-headline">{offerText.headline}</p>
                                            </div>
                                            <span className="pdp-offer-pill">{offerText.action}</span>
                                        </div>
                                        <p className="pdp-offer-sub">
                                            🏷️ <strong>{product.offer.offerName}</strong> — applied automatically at checkout
                                        </p>
                                    </div>
                                    <div className="pdp-offer-bar"><div className="pdp-offer-fill" /></div>
                                </div>
                            )}

                            {/* ── Main card: variants + qty + CTAs ── */}
                            <div className="pdp-card pdp-fade-up pdp-fade-up-d4">

                                {/* Attributes */}
                                {attributes.length > 0 && (
                                    <div style={{ marginBottom: 18 }}>
                                        <span className="pdp-attr-label">Choose your options</span>
                                        {attributes.map((attr) => (
                                            <div className="pdp-attr-block" key={attr.name}>
                                                <div className="pdp-attr-name">{attr.name}</div>
                                                <div className="pdp-attr-vals">
                                                    {attr.values.map((value) => {
                                                        const isSelected = selectedAttributes[attr.name] === value;
                                                        if (attr.name.toLowerCase() === "color") {
                                                            return (
                                                                <button
                                                                    key={value}
                                                                    className={`pdp-color-btn${isSelected ? " active" : ""}`}
                                                                    style={{ backgroundColor: value }}
                                                                    onClick={() => handleSelectAttribute(attr.name, value)}
                                                                    title={value}
                                                                />
                                                            );
                                                        }
                                                        return (
                                                            <button
                                                                key={value}
                                                                className={`pdp-size-btn${isSelected ? " active" : ""}`}
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
                                )}

                                {/* Qty + buttons */}
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
                                            // ripple
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
                                        disabled={addingToCart || cartSuccess || isOutOfStock}
                                    >
                                        {/* normal label */}
                                        <span className="pdp-cart-label">🛒 Add to Cart</span>

                                        {/* loading dots */}
                                        <span className="pdp-cart-loading">
                                            <span className="pdp-cart-dot" />
                                            <span className="pdp-cart-dot" />
                                            <span className="pdp-cart-dot" />
                                        </span>

                                        {/* success state */}
                                        <span className="pdp-cart-success">
                                            <svg className="pdp-check-svg" viewBox="0 0 16 16">
                                                <polyline className="pdp-check-path" points="2,8 6.5,12.5 14,4" />
                                            </svg>
                                            Added!
                                        </span>

                                        {/* particle burst */}
                                        <span className="pdp-cart-particles" aria-hidden="true">
                                            {[1, 2, 3, 4, 5, 6].map(i => <span key={i} className="pdp-particle" />)}
                                        </span>
                                    </button>
                                    <div className="pdp-buynow-wrap">
                                        <BuyNowButton
                                            product={product}
                                            productType={product?.type === "variable" ? "variable" : product?.type}
                                            selectedVariation={selectedVariation}
                                            quantity={count}
                                            disabled={isOutOfStock}
                                        />
                                    </div>
                                </div>

                                {/* Wishlist + size guide */}
                                <div className="pdp-icon-actions">
                                    <button
                                        className={`pdp-icon-btn${isWishlisted ? " w-on" : ""}`}
                                        onClick={() => productID && toggleWishlist(productID)}
                                        disabled={wishlistLoading}
                                    >
                                        {isWishlisted ? <FaHeart size={13} /> : <CiHeart size={15} />}
                                        {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                                    </button>
                                    {product?.type === "variable" && product?.sizeChartUrl && (
                                        <button className="pdp-icon-btn" onClick={() => setShowSizeChart(true)}>
                                            <CiRuler size={15} /> Size Guide
                                        </button>
                                    )}
                                </div>

                                {/* Trust strip */}
                                <div className="pdp-trust">
                                    <div className="pdp-trust-item">🚚 Free delivery above ₹499</div>
                                    <div className="pdp-trust-item">↩️ Easy 7-day returns</div>
                                    <div className="pdp-trust-item">🔒 Secure checkout</div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="pdp-fade-up pdp-fade-up-d5" style={{ marginTop: 20 }}>
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

                    {/* ── Sections + Reviews ── */}
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

            {/* ── Modals ── */}
            <CrossSellModal
                isOpen={showCrossSellModal}
                onClose={() => setShowCrossSellModal(false)}
                products={crossSellProducts}
                loading={false}
            />

            {product?.type === "variable" && product?.sizeChartUrl && (
                <Dialog open={showSizeChart} onOpenChange={(open) => !open && setShowSizeChart(false)}>
                    <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Size Chart</DialogTitle></DialogHeader>
                        <div className="mt-2">
                            <img src={product.sizeChartUrl} alt="Size chart" className="w-full h-auto object-contain" />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default ProductDetail;