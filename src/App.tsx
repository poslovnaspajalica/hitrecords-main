import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GridShop from "./pages/GridShop";
import ListShop from "./pages/ListShop";
import MagazineShop from "./pages/MagazineShop";
import MagazineProductDetail from "./pages/MagazineProductDetail";
import GridProductDetail from "./pages/GridProductDetail";
import ListProductDetail from "./pages/ListProductDetail";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Genres from "./pages/Genres";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Index from "./pages/Index";
import ShippingInfo from "./pages/ShippingInfo";
import Returns from "./pages/Returns";
import FAQ from "./pages/FAQ";
import CookieConsent from "./components/CookieConsent";
import Auth from "./pages/Auth";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Artists from '@/pages/Artists';
import ArtistDetail from "./pages/ArtistDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/grid-shop" element={<GridShop />} />
              <Route path="/grid-shop/product/:id" element={<GridProductDetail />} />
              <Route path="/list-shop" element={<ListShop />} />
              <Route path="/list-shop/product/:id" element={<ListProductDetail />} />
              <Route path="/magazine-shop" element={<MagazineShop />} />
              <Route path="/magazine-shop/product/:id" element={<MagazineProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/shipping-info" element={<ShippingInfo />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artists/:id" element={<ArtistDetail />} />
            </Routes>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;