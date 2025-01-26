import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Add from "@/pages/Add";
import Discover from "@/pages/Discover";
import Shops from "@/pages/Shops";
import LandingPage from "@/pages/LandingPage";
import Settings from "@/pages/Settings";
import Messages from "@/pages/Messages";
import Contest from "@/pages/Contest";
import Admin from "@/pages/Admin";
import Closet from "@/pages/Closet";
import Favorites from "@/pages/Favorites";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Index />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/add" element={<Add />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/contest" element={<Contest />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/closet" element={<Closet />} />
        <Route path="/favorites" element={<Favorites />} />
      </Route>
    </Routes>
  );
};