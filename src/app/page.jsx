import dynamic from "next/dynamic";
import HomeCategory from "@/components/categories/HomeCategory";

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

async function getProducts({ limit = 20, page = 1, categoryID = "", type = 'variable', sectionid = "" } = {}) {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  params.append("page", String(page));
  if (categoryID) params.append("categoryID", categoryID);
  if (type) params.append("type", type);
  if (sectionid) params.append("sectionid", sectionid);

  const res = await fetch(
    `https://backend.ithyaraa.com/api/products/all-products?${params.toString()}`,
    { next: { revalidate } }
  );

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
    // console.log('parsed', parsed);

    return parsed;
  });

  return {
    count: data.count,
    data: parsedProducts
  };
}

async function getCategories(limit = 10) {
  const res = await fetch(
    "https://backend.ithyaraa.com/api/categories/public",
    {
      // Align with page ISR
      next: { revalidate }
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await res.json();
  const categories = data?.data || [];

  // Ensure we never return more than the requested limit
  return categories.slice(0, limit);
}

async function getHomepageSections() {
  const res = await fetch(
    "https://backend.ithyaraa.com/api/homepage-sections/active",
    {
      next: { revalidate }
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch homepage sections");
  }

  const data = await res.json();
  return data?.data || [];
}

async function getSliderBanners() {
  const res = await fetch(
    "https://backend.ithyaraa.com/api/slider-banners/active",
    { next: { revalidate } }
  );

  if (!res.ok) {
    return { mobile: [], desktop: [] };
  }

  const data = await res.json();
  return data?.data ?? { mobile: [], desktop: [] };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.ithyaraa.com/api";

async function getPresaleProducts() {
  try {
    const res = await fetch(
      `${API_BASE}/presale/products/paginated?page=1&limit=5`,
      { next: { revalidate } }
    );
    if (!res.ok) return { data: [], pagination: null };
    const json = await res.json();
    return {
      data: json?.data ?? [],
      pagination: json?.pagination ?? null
    };
  } catch {
    return { data: [], pagination: null };
  }
}

async function getHomeCategories() {
  try {
    const res = await fetch(
      `${API_BASE}/home-categories`
    );
    if (!res.ok) return [];
    const data = await res.json();
    console.log('hello', data);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
async function getInitialTabbedProducts(limit = 12) {
  try {
    const res = await fetch(
      `${API_BASE}/products/shop?limit=${limit}&page=1`,
      { next: { revalidate } }
    );
    if (!res.ok) return { data: [], pagination: null };
    const json = await res.json();
    if (!json?.success) return { data: [], pagination: null };
    return {
      data: json.data ?? [],
      pagination: json.pagination ?? null
    };
  } catch {
    return { data: [], pagination: null };
  }
}


export default async function Home() {
  let section_one = [];
  let section_two = [];
  let categories = [];
  let homeCategories = [];
  let homepageSections = [];
  let sliderBanners = { mobile: [], desktop: [] };

  try {
    const section_one_raw = await getProducts({ sectionid: "HOME_HERO" });
    section_one = section_one_raw.data
    // console.log(section_one);

  } catch (error) {
    console.error(error);
    // Optionally render empty array or fallback data
  }
  try {
    const section_two_raw = await getProducts({ brandID: "IBR304499S" });
    section_two = section_two_raw.data
    // console.log(section_two);
  } catch (error) {
    console.error(error);
    // Optionally render empty array or fallback data
  }

  try {
    categories = await getCategories(10);
  } catch (error) {
    console.error(error);
  }

  try {
    homeCategories = await getHomeCategories();
  } catch (error) {
    console.error(error);
  }

  try {
    homepageSections = await getHomepageSections();
  } catch (error) {
    console.error(error);
  }

  try {
    sliderBanners = await getSliderBanners();
  } catch (error) {
    console.error(error);
  }

  let presaleInitial = { data: [], pagination: null };
  try {
    presaleInitial = await getPresaleProducts();
  } catch (error) {
    console.error(error);
  }

  let tabbedInitial = { data: [], pagination: null };
  try {
    tabbedInitial = await getInitialTabbedProducts(12);
  } catch (error) {
    console.error(error);
  }

  const mobileSlides = sliderBanners.mobile?.length
    ? sliderBanners.mobile
    : [
      "https://images.bewakoof.com/uploads/grid/app/1x1-July25-MadIniNdiaSale-Extended-72hours-IK-1755187851.gif",
      "https://images.bewakoof.com/uploads/grid/app/1x1---CFT-men-1755188060.jpg",
      "https://images.bewakoof.com/uploads/grid/app/1x1-Shirts-Men-Sale-BANNER-1755188012.jpg",
    ];
  const desktopSlides = sliderBanners.desktop?.length
    ? sliderBanners.desktop
    : [
      "https://www.beyoung.in/api/catalog/HomePageJuly2025/new-shirt-banner-desktop-view.jpg",
      "https://www.beyoung.in/api/catalog/HomePageJuly2025/Pyjama-banner-desktop-view-newfri-25.jpg",
      "https://www.beyoung.in/api/catalog/HomePageJuly2025/Combo-banner2-desktop-view.jpg",
      "https://www.beyoung.in/api/catalog/HomePageJuly2025/Pyjama-banner-desktop-view-newfri-25.jpg",
    ];

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
        slides={mobileSlides}
      />
      <Slider
        slideWidthPercent={1}
        showButtons={false}
        autoplay={true}
        autoplayInterval={3000}
        slides={desktopSlides}
      />
      <RollingText text1="YOUNG ELEGANT SURPRISING" text2="PRIMARY DRESES" direction="left" />
      <FeaturingBlock />
      <RollingText text1="YOUNG ELEGANT SURPRISING" text2="PRIMARY DRESES" direction="right" />
      <DesktopCategories
        heading="Our Latest Collections"
        subHeading="Browse by category"
        categories={categories}
      />
      <ProductSection
        heading="Picks Curated For You"
        subHeading="Collections You Will Definitely Love"
        products={section_one}
      />
      <ProductSection
        heading="Picks Curated For You"
        subHeading="Collections You Will Definitely Love"
        products={section_two}
      />
      {/* <hr /> */}
      <UnderSections />
      {/* <hr /> */}


      <PresaleSection
        heading="Pre-Booking Available"
        subHeading="Found a perfect place"
        initialProducts={presaleInitial.data}
        initialPagination={presaleInitial.pagination}
      />

      <ProductSection
        heading="Another Section"
        subHeading="More things to explore"
        products={section_one}
      />


      <HomeCategory categories={homeCategories} />
      <ReelsSection
        heading="Our Stories"
        subHeading="Watch and be inspired"
      />
      {/* Tabbed Product Section with Categories */}
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
