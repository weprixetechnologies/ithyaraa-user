import Header from "@/components/header/header";
import Footer from "@/components/footer/Footer";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import StoreProvider from "@/redux/provider";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProductBadgesProvider } from "@/contexts/ProductBadgesContext";

import ReferralTracker from "@/components/ReferralTracker";
import { Suspense } from "react";
import NavigationProgress from "@/components/ui/NavigationProgress";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ithyaraa.com'),
  title: {
    default: 'ITHYARAA – Fashion for GenZ & Millennials',
    template: '%s | ITHYARAA',
  },
  description: 'Discover the latest trends in fashion at ITHYARAA.',
  openGraph: {
    title: 'ITHYARAA – Fashion for GenZ & Millennials',
    description: 'Discover the latest trends in fashion at ITHYARAA.',
    url: '/',
    siteName: 'ITHYARAA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ITHYARAA',
    description: 'Discover the latest trends in fashion at ITHYARAA.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <AuthProvider>
            <WishlistProvider>
              <ProductBadgesProvider>
                <ReferralTracker />
                <ToastContainer />
                <Header />
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
              </ProductBadgesProvider>
            </WishlistProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
