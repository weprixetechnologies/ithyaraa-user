import { notFound } from "next/navigation";
import ComboInteractive from "@/components/products/ComboInteractive";

const safeParse = (v) => { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; } };

async function getComboData(id) {
    const res = await fetch(`https://backend.ithyaraa.com/api/combo/detail-user/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body.data) return null;
    return body.data;
}

// Reuse the fetchProducts / BuyMore Products logic
async function getBuyMoreProducts() {
    const params = new URLSearchParams({ limit: "20", page: "1", type: "variable" });
    const res = await fetch(`https://backend.ithyaraa.com/api/products/all-products?${params.toString()}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data || []).map(p => {
        const parsed = { ...p };
        ["galleryImage", "featuredImage", "categories"].forEach(f => {
            if (f in parsed) parsed[f] = safeParse(parsed[f]);
        });
        return parsed;
    });
}

// SEO Meta
export async function generateMetadata({ params }) {
    const { productID } = await params;
    const product = await getComboData(productID);
    if (!product) return { title: "Combo Not Found" };

    const firstImage = product.featuredImage?.[0]?.imgUrl || "";
    return {
        title: `${product.name} | Ithyaraa Combo`,
        description: product.description || "Get the best combo offers at Ithyaraa.",
        openGraph: {
            title: product.name,
            description: product.description,
            images: firstImage ? [{ url: firstImage }] : [],
            type: "website"
        }
    };
}

export default async function ComboDetailPage({ params }) {
    const { productID } = await params;

    const [productRes, buyMoreRes] = await Promise.allSettled([
        getComboData(productID),
        getBuyMoreProducts()
    ]);

    const product = productRes.status === "fulfilled" ? productRes.value : null;
    const buyMoreProducts = buyMoreRes.status === "fulfilled" ? buyMoreRes.value : [];

    if (!product) notFound();

    const baseUrl = "https://ithyaraa.com";
    const productUrl = `${baseUrl}/combo/${productID}`;
    const image = product.featuredImage?.[0]?.imgUrl || "";

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Combos", "item": `${baseUrl}/shop` },
            { "@type": "ListItem", "position": 3, "name": product.name, "item": productUrl }
        ]
    };

    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": image,
        "description": product.description || product.name,
        "sku": product.productID || productID,
        "brand": { "@type": "Brand", "name": "Ithyaraa" },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "INR",
            "price": product.salePrice,
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
            <ComboInteractive
                productID={productID}
                product={product}
                buyMoreProducts={buyMoreProducts}
            />
        </>
    );
}
