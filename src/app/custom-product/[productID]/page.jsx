import { notFound } from "next/navigation";
import CustomProductInteractive from "@/components/products/CustomProductInteractive";

const safeParse = (v) => { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; } };

async function getProductData(id) {
    const res = await fetch(`https://backend.ithyaraa.com/api/products/details/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body.product) return null;
    const product = body.product;
    return {
        ...product,
        featuredImage: safeParse(product.featuredImage) || [],
        galleryImage: safeParse(product.galleryImage) || [],
        custom_inputs: safeParse(product.custom_inputs) || [],
        dressTypes: safeParse(product.dressTypes) || [],
    };
}

async function getReviewStats(id) {
    const res = await fetch(`https://backend.ithyaraa.com/api/reviews/product/${id}/stats`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const body = await res.json();
    return body.success ? body.data : null;
}

const SECTION_POOL = ["HOME_HERO", "MUST_TRY", "FEATURING", "NEW_ARRIVAL", "TOP_DEALS"];
const SECTION_META = {
    HOME_HERO: { heading: "Picks Curated For You", subHeading: "Collections You Will Definitely Love" },
    MUST_TRY: { heading: "Must Try Outfits", subHeading: "Curated Choice Now" },
    FEATURING: { heading: "Featured Collections", subHeading: "Handpicked for your style" },
    NEW_ARRIVAL: { heading: "New Arrivals", subHeading: "The latest trends just for you" },
    TOP_DEALS: { heading: "Top Deals", subHeading: "Unbeatable prices on favorites" },
};

async function getDynamicSections() {
    const shuffled = [...SECTION_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    const sections = await Promise.allSettled(
        shuffled.map(async (sectionid) => {
            const params = new URLSearchParams({ limit: "12", sectionid });
            const res = await fetch(`https://backend.ithyaraa.com/api/products/all-products?${params}`, { next: { revalidate: 300 } });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            const products = (data?.data || []).map(p => ({
                ...p,
                galleryImage: safeParse(p.galleryImage),
                featuredImage: safeParse(p.featuredImage),
                categories: safeParse(p.categories)
            }));
            return { id: sectionid, products, ...SECTION_META[sectionid] };
        })
    );
    return sections.filter(s => s.status === "fulfilled" && s.value.products.length > 0).map(s => s.value);
}

export async function generateMetadata({ params }) {
    const { productID } = await params;
    const product = await getProductData(productID);
    if (!product) return { title: "Product Not Found" };

    const firstImage = product.featuredImage?.[0]?.imgUrl || "";
    return {
        title: `${product.name} | Ithyaraa Customization`,
        description: product.description || "Customize your exclusive apparel with Ithyaraa.",
        openGraph: {
            title: product.name,
            description: product.description,
            images: firstImage ? [{ url: firstImage }] : [],
            type: "website"
        }
    };
}

export default async function CustomProductDetailPage({ params }) {
    const { productID } = await params;

    const [productRes, reviewRes, sectionsRes] = await Promise.allSettled([
        getProductData(productID),
        getReviewStats(productID),
        getDynamicSections()
    ]);

    const product = productRes.status === "fulfilled" ? productRes.value : null;
    const reviewStats = reviewRes.status === "fulfilled" ? reviewRes.value : null;
    const dynamicSections = sectionsRes.status === "fulfilled" ? sectionsRes.value : [];

    if (!product) notFound();

    const baseUrl = "https://ithyaraa.com";
    const productUrl = `${baseUrl}/custom-product/${productID}`;
    const image = product.featuredImage?.[0]?.imgUrl || "";

    const activePrice = product.dressTypes?.length > 0
        ? product.dressTypes[0].price
        : (product.salePrice || product.regularPrice);

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Custom Products", "item": `${baseUrl}/shop` },
            { "@type": "ListItem", "position": 3, "name": product.name, "item": productUrl }
        ]
    };

    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": image,
        "description": product.description || product.name,
        "sku": product.productID,
        "brand": { "@type": "Brand", "name": product.brand || "Ithyaraa" },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "INR",
            "price": activePrice,
            "availability": product.status === "In Stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    if (reviewStats && reviewStats.totalReviews > 0) {
        productSchema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": reviewStats.averageRating || 5,
            "reviewCount": reviewStats.totalReviews
        };
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

            <CustomProductInteractive
                productID={productID}
                product={product}
                customInputs={product.custom_inputs}
                dressTypes={product.dressTypes}
                reviewStats={reviewStats || {
                    totalReviews: 0, averageRating: 0,
                    ratingBreakdown: [5, 4, 3, 2, 1].map(r => ({ rating: r, count: 0 }))
                }}
                dynamicSections={dynamicSections}
            />
        </>
    );
}