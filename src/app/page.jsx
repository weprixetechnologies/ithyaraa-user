import Image from "next/image";
import logo from "../../public/ithyaraa-logo.png";
import Slider from "@/components/ui/imageSlider";
import TilledMiniCategories from "@/components/ui/tilledMiniCategories";
import RollingText from "@/components/ui/rollingText";
import FeaturingBlock from "@/components/ui/featuringBlock";
import ProductSection from "@/components/home/ProductSection";

// ISR: regenerate this page every 10 seconds
export const revalidate = 10;

async function getProducts({ limit = 20, page = 1, categoryID = "", type = 'variable' } = {}) {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  params.append("page", String(page));
  if (categoryID) params.append("categoryID", categoryID);
  if (type) params.append("type", type);

  const res = await fetch(
    `http://192.168.1.9:3300/api/products/all-products?${params.toString()}`
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


export default async function Home() {
  console.log("Rendering Home Page (ISR)");

  let section_one = [];
  try {
    const section_one_raw = await getProducts();
    section_one = section_one_raw.data
    // console.log(section_one);

  } catch (error) {
    console.error(error);
    // Optionally render empty array or fallback data
  }

  return (
    <>
      <TilledMiniCategories />
      <Slider
        aspectratio="aspect-[1/1]"
        showButtons={false}
        isMobile={true}
        autoplay={true}
        autoplayInterval={3000}
        slideWidthPercent={0.9}
        slides={[
          "https://images.bewakoof.com/uploads/grid/app/1x1-July25-MadIniNdiaSale-Extended-72hours-IK-1755187851.gif",
          "https://images.bewakoof.com/uploads/grid/app/1x1---CFT-men-1755188060.jpg",
          "https://images.bewakoof.com/uploads/grid/app/1x1-Shirts-Men-Sale-BANNER-1755188012.jpg",
        ]}
      />
      <Slider
        slideWidthPercent={1}
        showButtons={false}
        slides={[
          "https://www.beyoung.in/api/catalog/HomePageJuly2025/new-shirt-banner-desktop-view.jpg",
          "https://www.beyoung.in/api/catalog/HomePageJuly2025/Pyjama-banner-desktop-view-newfri-25.jpg",
          "https://www.beyoung.in/api/catalog/HomePageJuly2025/Combo-banner2-desktop-view.jpg",
          "https://www.beyoung.in/api/catalog/HomePageJuly2025/Pyjama-banner-desktop-view-newfri-25.jpg",
        ]}
      />
      <RollingText text1="YOUNG ELEGANT SURPRISING" text2="PRIMARY DRESES" direction="left" />
      <FeaturingBlock />
      <RollingText text1="YOUNG ELEGANT SURPRISING" text2="PRIMARY DRESES" direction="right" />

      <ProductSection
        heading="Picks Curated For You"
        subHeading="Collections You Will Definitely Love"
        products={section_one}
      />
      <hr />
      <ProductSection
        heading="Another Section"
        subHeading="More things to explore"
        products={section_one}
      />
    </>
  );
}
