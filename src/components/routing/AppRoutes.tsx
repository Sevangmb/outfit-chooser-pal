import { Routes, Route } from "react-router-dom";
import { Index } from "@/pages/Index";
import { Auth } from "@/pages/Auth";
import { LandingPage } from "@/pages/LandingPage";
import { Closet } from "@/pages/Closet";
import { Add } from "@/pages/Add";
import { Profile } from "@/pages/Profile";
import { Messages } from "@/pages/Messages";
import { Discover } from "@/pages/Discover";
import { Favorites } from "@/pages/Favorites";
import { Contest } from "@/pages/Contest";
import { Admin } from "@/pages/Admin";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { ShopSection } from "@/components/shop/ShopSection";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute />}>
        <Route index element={<LandingPage />} />
        <Route path="auth" element={<Auth />} />
      </Route>

      <Route path="app" element={<ProtectedRoute />}>
        <Route index element={<Index />} />
        <Route path="closet" element={<Closet />} />
        <Route path="add" element={<Add />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<Messages />} />
        <Route path="discover" element={<Discover />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="contest" element={<Contest />} />
        <Route path="admin" element={<Admin />} />
        <Route path="shop" element={<ShopSection />} />
      </Route>
    </Routes>
  );
};