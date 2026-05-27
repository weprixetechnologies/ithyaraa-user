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

// ISR: regenerate this page every 3600 seconds (1 hour)
export const revalidate = 3600;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7885/api";

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

function parseProducts(data) {
  return (data?.data || []).map((product) => {
    const parsed = { ...product };
    JSON_FIELDS.forEach((field) => {
      if (field in parsed) {
        parsed[field] = safeParse(parsed[field]);
      }
    });
    return parsed;
  });
}

async function getProducts({ limit = 20, page = 1, categoryID = "", type = "", sectionid = "" } = {}) {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  params.append("page", String(page));
  if (categoryID) params.append("categoryID", categoryID);
  if (type) params.append("type", type);
  if (sectionid) params.append("sectionid", sectionid);

  const res = await fetch(
    `${API_BASE}/products/all-products?${params.toString()}`,
    { next: { revalidate } }
  );

  if (!res.ok) throw new Error(`Failed to fetch products (sectionid: ${sectionid})`);

  const data = await res.json();

  return {
    count: data.count,
    data: parseProducts(data),
  };
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
  // FIX: Fetch all data in parallel instead of sequentially
  const [
    sectionOneResult,
    sectionTwoResult,
    sectionThreeResult,
    categoriesResult,
    homepageSectionsResult,
    sliderBannersResult,
    featuredBlocksResult,
    presaleResult,
    tabbedResult,
  ] = await Promise.allSettled([
    getProducts({ sectionid: "brand_picks" }),
    getProducts({ sectionid: "new_arrivals" }),
    getProducts({ sectionid: "dress_month" }),
    getCategories(),
    getHomepageSections(),
    getSliderBanners(),
    getFeaturedBlocks(),
    getPresaleProducts(),
    getInitialTabbedProducts(12),
  ]);

  // Safely unwrap each result with a fallback
  const section_one = sectionOneResult.status === "fulfilled" ? sectionOneResult.value.data : [];
  const section_two = sectionTwoResult.status === "fulfilled" ? sectionTwoResult.value.data : [];
  const section_three = sectionThreeResult.status === "fulfilled" ? sectionThreeResult.value.data : [];
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const homepageSections = homepageSectionsResult.status === "fulfilled" ? homepageSectionsResult.value : [];
  const sliderBanners = sliderBannersResult.status === "fulfilled" ? sliderBannersResult.value : { mobile: [], desktop: [] };
  const featuredBlocks = featuredBlocksResult.status === "fulfilled" ? featuredBlocksResult.value : [];
  const presaleInitial = presaleResult.status === "fulfilled" ? presaleResult.value : { data: [], pagination: null };
  const tabbedInitial = tabbedResult.status === "fulfilled" ? tabbedResult.value : { data: [], pagination: null };

  // Log any fetch failures for observability
  [
    ["brand_picks", sectionOneResult],
    ["new_arrivals", sectionTwoResult],
    ["dress_month", sectionThreeResult],
    ["categories", categoriesResult],
    ["homepageSections", homepageSectionsResult],
    ["sliderBanners", sliderBannersResult],
    ["featuredBlocks", featuredBlocksResult],
    ["presale", presaleResult],
    ["tabbedProducts", tabbedResult],
  ].forEach(([label, result]) => {
    if (result.status === "rejected") {
      console.error(`[Home] Failed to fetch "${label}":`, result.reason);
    }
  });

  const mobileSlides = normalizeBanners(sliderBanners?.mobile);
  const desktopSlides = normalizeBanners(sliderBanners?.desktop);

  const finalMobileSlides = mobileSlides.length > 0 ? mobileSlides : FALLBACK_SLIDES;
  const finalDesktopSlides = desktopSlides.length > 0 ? desktopSlides : FALLBACK_SLIDES;

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

      <FeaturingBlock blocks={featuredBlocks} />

      <RollingText text1="YOUNG ELEGANT SURPRISING" text2="PRIMARY DRESES" direction="right" />

      <DesktopCategories
        heading="Our Latest Collections"
        subHeading="Browse by category"
        categories={categories}
      />

      <ProductSection
        heading="Curated With Our Brand Partners"
        subHeading="Timeless Collections You'll Love"
        products={section_one}
      />

      <ProductSection
        heading="The New Edit"
        subHeading="Collections You Will Definitely Love"
        products={section_two}
      />

      <UnderSections />

      <PresaleSection
        heading="Pre-Booking Available"
        subHeading="Found a perfect place"
        initialProducts={presaleInitial.data}
        initialPagination={presaleInitial.pagination}
      />

      <ProductSection
        heading="Trending Picks"
        subHeading="Our Curated Dress of the Month"
        products={section_three}
      />

      <ReelsSection
        heading="Our Stories"
        subHeading="Watch and be inspired"
      />

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