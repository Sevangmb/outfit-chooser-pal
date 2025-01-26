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
import Suitcase from "@/pages/Suitcase";
import Community from "@/pages/Community";
import { AddClothingForm } from "@/components/AddClothingForm";
import { OutfitCreator } from "@/components/OutfitCreator";

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/terms" element={<div>CGU</div>} />
      <Route path="/privacy" element={<div>Politique de confidentialité</div>} />
      <Route path="/about" element={<div>À propos de FRING!</div>} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Index />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/perso" element={<Add />} />
      <Route path="/add" element={<AddClothingForm />} />
      <Route path="/outfit/create" element={<OutfitCreator clothes={[]} />} />
      <Route path="/outfit/publish" element={<div>Publier un look</div>} />
      <Route path="/suitcase/create" element={<Suitcase />} />
      <Route path="/shops" element={<Shops />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/community" element={<Community />} />
      <Route path="/contest" element={<Contest />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/closet" element={<Closet />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/faq" element={<div>FAQ</div>} />
      <Route path="/guides" element={<div>Guides et tutoriels</div>} />
      <Route path="/contact" element={<div>Contact</div>} />
    </Route>
  </Routes>
);