import { Montserrat, Roboto, Poppins } from "next/font/google";
import Header from "@/components/header/header";
import Footer from "@/components/footer/Footer";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import StoreProvider from "@/redux/provider";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400", "500", "700"] });
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

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
    <html lang="en" className={`${montserrat.variable} ${roboto.variable} ${poppins.variable}`}>
      <body>
        <StoreProvider>
          <AuthProvider>
            <WishlistProvider>
              <ToastContainer />
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </WishlistProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
