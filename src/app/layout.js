import { Montserrat, Roboto, Poppins } from "next/font/google";
import Header from "@/components/header/header";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import StoreProvider from "@/redux/provider";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400", "500", "700"] });
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata = {
  title: "ITHYARAA - ULTIMATE STOP",
  description: "The All New Great Stop for Genz and Millenials",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable} ${poppins.variable}`}>
      <body>
        <StoreProvider>
          <ToastContainer />
          <Header />
          {children}
        </StoreProvider>

      </body>
    </html>
  );
}
