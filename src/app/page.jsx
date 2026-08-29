import dynamic from "next/dynamic";

// Lazy load components for better performance
const Slider = dynamic(() => import("@/components/ui/imageSlider"), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
});
const DesktopCategories = dynamic(() => import("@/components/homeComponents/desktopCategories"), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
});
const TilledMiniCategories = dynamic(() => import("@/components/ui/tilledMiniCategories"), {
  loading: () => <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
});
const RollingText = dynamic(() => import("@/components/ui/rollingText"), {
  loading: () => <div className="h-16 bg-gray-200 animate-pulse rounded-lg" />
});
const FeaturingBlock = dynamic(() => import("@/components/ui/featuringBlock"), {
  loading: () => <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
});
const ProductSection = dynamic(() => import("@/components/home/ProductSection"), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
});
const TabbedProductSection = dynamic(() => import("@/components/home/TabbedProductSection"), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
});
const UnderSections = dynamic(() => import("@/components/homeComponents/underSections"), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
});
const PresaleSection = dynamic(() => import("@/components/homeComponents/presaleSections"), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
});
const ReelsSection = dynamic(() => import("@/components/home/ReelsSection"), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
});
const TestimonialSlider = dynamic(() => import("@/components/home/TestimonialSlider"), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
});
const BrandSection = dynamic(() => import("@/components/home/BrandSection"), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
});

// ISR: regenerate this page every 3600 seconds (1 hour)
export const revalidate = 3600;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.ithyaraa.com/api";

// Helper to safely JSON.parse any field
const safeParse = (value) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch (err) {
    console.warn("safeParse failed for value:", value, err);
    return value;
  }
};

const JSON_FIELDS = ["galleryImage", "featuredImage", "categories"];

/**
 * Fetch all active homepage tag-managed sections with products in a SINGLE API call
 */
async function getActiveTagSections() {
  try {
    const res = await fetch(`${API_BASE}/homepage-tag-sections/active?limit=20`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success) return [];

    return (json?.data || []).map((sec) => ({
      ...sec,
      products: (sec.products || []).map((product) => {
        const parsed = { ...product };
        JSON_FIELDS.forEach((field) => {
          if (field in parsed) {
            parsed[field] = safeParse(parsed[field]);
          }
        });
        return parsed;
      }),
    }));
  } catch (err) {
    console.error("[Home] Error fetching active tag sections:", err);
    return [];
  }
}

async function getCategories() {
  const res = await fetch(`${API_BASE}/categories/featured`, {
    next: { revalidate },
  });
  if (!res.ok) throw new Error("Failed to fetch featured categories");
  const data = await res.json();
  return data?.data || [];
}

async function getHomepageSections() {
  const res = await fetch(`${API_BASE}/homepage-sections/active`, {
    next: { revalidate },
  });
  if (!res.ok) throw new Error("Failed to fetch homepage sections");
  const data = await res.json();
  return data?.data || [];
}

async function getSliderBanners() {
  const res = await fetch(`${API_BASE}/slider-banners/active`, {
    next: { revalidate },
  });
  if (!res.ok) return { mobile: [], desktop: [] };
  const data = await res.json();
  return data?.data ?? { mobile: [], desktop: [] };
}

async function getFeaturedBlocks() {
  const res = await fetch(`${API_BASE}/featured-blocks/active`, {
    next: { revalidate },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data || [];
}

async function getPresaleProducts() {
  const res = await fetch(`${API_BASE}/presale/products/paginated?page=1&limit=5`, {
    next: { revalidate },
  });
  if (!res.ok) return { data: [], pagination: null };
  const json = await res.json();
  return {
    data: json?.data ?? [],
    pagination: json?.pagination ?? null,
  };
}

async function getInitialTabbedProducts(limit = 12) {
  const res = await fetch(`${API_BASE}/products/shop?limit=${limit}&page=1`, {
    next: { revalidate },
  });
  if (!res.ok) return { data: [], pagination: null };
  const json = await res.json();
  if (!json?.success) return { data: [], pagination: null };
  return {
    data: json.data ?? [],
    pagination: json.pagination ?? null,
  };
}

async function getBrands() {
  try {
    const res = await fetch(`${API_BASE}/admin/brands`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data || [];
  } catch (err) {
    console.error("[Home] Error fetching brands:", err);
    return [];
  }
}

async function getCategoryBrandsMap() {
  try {
    const res = await fetch(`${API_BASE}/categories/brands-map`, {
      next: { revalidate },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data?.data || {};
  } catch (err) {
    console.error("[Home] Error fetching category brands map:", err);
    return {};
  }
}

// Fallback slides (replace these with your own brand assets)
const FALLBACK_SLIDES = [
  { src: "/images/fallback-banner-1.jpg" },
  { src: "/images/fallback-banner-2.jpg" },
  { src: "/images/fallback-banner-3.jpg" },
];

function normalizeBanners(banners = []) {
  return banners
    .filter((b) => b.image_url)
    .map((b) => ({
      src: b.image_url,
      routeTo: b.routeTo,
      minPrice: b.minPrice,
      maxPrice: b.maxPrice,
      categoryID: b.category,
      offerID: b.offer,
    }));
}

export default async function Home() {
  // Fetch all homepage data concurrently in parallel
  const [
    tagSectionsResult,
    categoriesResult,
    homepageSectionsResult,
    sliderBannersResult,
    featuredBlocksResult,
    presaleResult,
    tabbedResult,
    brandsResult,
    categoryBrandsMapResult,
  ] = await Promise.allSettled([
    getActiveTagSections(),
    getCategories(),
    getHomepageSections(),
    getSliderBanners(),
    getFeaturedBlocks(),
    getPresaleProducts(),
    getInitialTabbedProducts(12),
    getBrands(),
    getCategoryBrandsMap(),
  ]);

  // Safely unwrap each result with a fallback
  const tagSections = tagSectionsResult.status === "fulfilled" ? tagSectionsResult.value : [];
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const homepageSections = homepageSectionsResult.status === "fulfilled" ? homepageSectionsResult.value : [];
  const sliderBanners = sliderBannersResult.status === "fulfilled" ? sliderBannersResult.value : { mobile: [], desktop: [] };
  const featuredBlocks = featuredBlocksResult.status === "fulfilled" ? featuredBlocksResult.value : [];
  const presaleInitial = presaleResult.status === "fulfilled" ? presaleResult.value : { data: [], pagination: null };
  const tabbedInitial = tabbedResult.status === "fulfilled" ? tabbedResult.value : { data: [], pagination: null };
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value : [];
  const categoryBrandsMap = categoryBrandsMapResult.status === "fulfilled" ? categoryBrandsMapResult.value : {};

  // Log any fetch failures for observability
  [
    ["tagSections", tagSectionsResult],
    ["categories", categoriesResult],
    ["homepageSections", homepageSectionsResult],
    ["sliderBanners", sliderBannersResult],
    ["featuredBlocks", featuredBlocksResult],
    ["presale", presaleResult],
    ["tabbedProducts", tabbedResult],
    ["brands", brandsResult],
    ["categoryBrandsMap", categoryBrandsMapResult],
  ].forEach(([label, result]) => {
    if (result.status === "rejected") {
      console.error(`[Home] Failed to fetch "${label}":`, result.reason);
    }
  });

  const mobileSlides = normalizeBanners(sliderBanners?.mobile);
  const desktopSlides = normalizeBanners(sliderBanners?.desktop);

  const finalMobileSlides = mobileSlides.length > 0 ? mobileSlides : FALLBACK_SLIDES;
  const finalDesktopSlides = desktopSlides.length > 0 ? desktopSlides : FALLBACK_SLIDES;

  // Split tag sections dynamically for optimal visual rhythm
  const topTagSections = tagSections.length > 2 ? tagSections.slice(0, 2) : tagSections;
  const bottomTagSections = tagSections.length > 2 ? tagSections.slice(2) : [];

  return (
    <>
      <h1 className="sr-only">ITHYARAA – Your Ultimate Fashion Destination</h1>

      <TilledMiniCategories sections={homepageSections} />

      <Slider
        aspectratio="aspect-[1/1]"
        showButtons={false}
        isMobile={true}
        autoplay={true}
        autoplayInterval={3000}
        slideWidthPercent={0.9}
        slides={finalMobileSlides}
      />

      <Slider
        slideWidthPercent={1}
        showButtons={false}
        autoplay={true}
        autoplayInterval={3000}
        slides={finalDesktopSlides}
      />

      <RollingText text1="YOUNG ELEGANT SURPRISING" text2="PRIMARY DRESES" direction="left" />
      {/* brand */}
      <BrandSection
        heading="Brands We Partner With"
        subHeading="Discover trusted fashion brands & creators"
        brands={brands}
      />

      <FeaturingBlock blocks={featuredBlocks} />

      <RollingText text1="YOUNG ELEGANT SURPRISING" text2="PRIMARY DRESES" direction="right" />

      <DesktopCategories
        heading="Our Latest Collections"
        subHeading="Browse by category"
        categories={categories}
        categoryBrandsMap={categoryBrandsMap}
      />


      {topTagSections.map((sec) => (
        <ProductSection
          key={sec.id || sec.tag}
          heading={sec.title}
          subHeading={sec.description}
          products={sec.products || []}
        />
      ))}

      <UnderSections />

      <PresaleSection
        heading="Pre-Booking Available"
        subHeading="Found a perfect place"
        initialProducts={presaleInitial.data}
        initialPagination={presaleInitial.pagination}
      />

      {bottomTagSections.map((sec) => (
        <ProductSection
          key={sec.id || sec.tag}
          heading={sec.title}
          subHeading={sec.description}
          products={sec.products || []}
        />
      ))}

      <ReelsSection
        heading="Our Stories"
        subHeading="Watch and be inspired"
      />

      <TestimonialSlider />

      <TabbedProductSection
        heading="Shop by Category"
        subHeading="Explore our amazing collection"
        categories={categories}
        initialProducts={tabbedInitial.data}
        initialPagination={tabbedInitial.pagination}
        initialLimit={12}
        loadMoreLimit={12}
      />
    </>
  );
}