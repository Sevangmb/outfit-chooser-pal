import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import LandingPage from "@/pages/LandingPage";
import Closet from "@/pages/Closet";
import Add from "@/pages/Add";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Discover from "@/pages/Discover";
import Favorites from "@/pages/Favorites";
import Contest from "@/pages/Contest";
import Admin from "@/pages/Admin";
import Suitcase from "@/pages/Suitcase";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { ShopSection } from "@/components/shop/ShopSection";
import { SuitcaseDetails } from "@/components/suitcase/SuitcaseDetails";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </PublicRoute>
        }
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="/app" element={<Index />} />
              <Route path="/closet" element={<Closet />} />
              <Route path="/add" element={<Add />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/contest" element={<Contest />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/shop" element={<ShopSection />} />
              <Route path="/suitcase" element={<Suitcase />} />
              <Route path="/suitcase/:id" element={<SuitcaseDetails />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};