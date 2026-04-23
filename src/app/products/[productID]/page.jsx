import axios from "axios";
import ProductInteractive from "@/components/products/ProductInteractive";

// ─── Constants ────────────────────────────────────────────────────────────────
const SECTION_POOL = ["HOME_HERO", "MUST_TRY", "FEATURING", "NEW_ARRIVAL", "TOP_DEALS"];
const SECTION_META = {
    HOME_HERO: { heading: "Picks Curated For You", subHeading: "Collections You Will Definitely Love" },
    MUST_TRY: { heading: "Must Try Outfits", subHeading: "Curated Choice Now" },
    FEATURING: { heading: "Featured Collections", subHeading: "Handpicked for your style" },
    NEW_ARRIVAL: { heading: "New Arrivals", subHeading: "The latest trends just for you" },
    TOP_DEALS: { heading: "Top Deals", subHeading: "Unbeatable prices on favorites" },
};

const safeParse = (v) => { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; } };

// ─── API Helpers ──────────────────────────────────────────────────────────────
async function fetchSectionProducts({ limit = 20, page = 1, categoryID = "", type = "variable", sectionid = "" } = {}) {
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

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
    const { productID } = await params;
    try {
        const res = await axios.get(`https://backend.ithyaraa.com/api/products/details/${productID}`);
        const product = res.data.product;

        const featuredImageStr = safeParse(product.featuredImage);
        const imageUrl = featuredImageStr?.[0]?.imgUrl || '/og-image.jpg';

        return {
            title: `${product.name} | ITHYARAA`,
            description: product.description?.substring(0, 160) || `Buy ${product.name} at Ithyaraa.`,
            openGraph: {
                title: `${product.name} | ITHYARAA`,
                description: product.description?.substring(0, 160) || `Buy ${product.name} at Ithyaraa.`,
                images: [imageUrl],
                type: 'website'
            }
        };
    } catch (err) {
        return { title: 'Product Not Found | ITHYARAA' };
    }
}

// ─── Server Component ─────────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }) {
    const { productID } = await params;

    // Fetch all initial page data concurrently
    const [productRes, reviewRes, buyMoreRes] = await Promise.allSettled([
        axios.get(`https://backend.ithyaraa.com/api/products/details/${productID}`),
        axios.get(`https://backend.ithyaraa.com/api/reviews/product/${productID}/stats`),
        fetchSectionProducts({ limit: 20 })
    ]);

    if (productRes.status === "rejected" || !productRes.value.data.product) {
        return <p className="text-center mt-10">Product not found</p>;
    }

    let productData = productRes.value.data.product;
    ["galleryImage", "featuredImage", "categories", "productAttributes"].forEach((f) => {
        productData[f] = safeParse(productData[f]);
    });

    const reviewStats = reviewRes.status === "fulfilled" && reviewRes.value.data.success
        ? reviewRes.value.data.data
        : { averageRating: 0, totalReviews: 0, ratingBreakdown: [] };

    const buyMoreProducts = buyMoreRes.status === "fulfilled" ? buyMoreRes.value.data : [];

    // Select random unique sections and fetch concurrently
    const shuffled = [...SECTION_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    const sectionPromises = shuffled.map(async (id) => {
        try {
            const data = await fetchSectionProducts({ sectionid: id, limit: 12 });
            if (data.data.length > 0) return { id, products: data.data, ...SECTION_META[id] };
        } catch { return null; }
    });

    let dynamicSections = await Promise.all(sectionPromises);
    dynamicSections = dynamicSections.filter(Boolean); // Clean out nulls

    const price = productData.salePrice || productData.regularPrice;

    const jsonLdProduct = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": productData.name,
        "image": productData.featuredImage?.[0]?.imgUrl,
        "description": productData.description || "Ithyaraa product",
        "sku": productID,
        "brand": {
            "@type": "Brand",
            "name": productData.brand || "Ithyaraa"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": price,
            "availability": "https://schema.org/InStock"
        },
        ...(reviewStats.totalReviews > 0 && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": reviewStats.averageRating || 5,
                "reviewCount": reviewStats.totalReviews
            }
        })
    };

    const jsonLdBreadcrumb = {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://ithyaraa.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": "https://ithyaraa.com/shop"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": productData.name,
                "item": `https://ithyaraa.com/products/${productID}`
            }
        ]
    };

    return (
        <>
            {/* Inject Structured Data for Google Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLdProduct)
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLdBreadcrumb)
                }}
            />

            {/* Pass server-fetched data into client component for interactivity */}
            <ProductInteractive
                productID={productID}
                product={productData}
                reviewStats={reviewStats}
                buyMoreProducts={buyMoreProducts}
                dynamicSections={dynamicSections}
            />
        </>
    );
}