import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { FavoriteOutfits } from "@/components/FavoriteOutfits";

const Favorites = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <Header className="container py-8 mt-16" />

      <div className="container py-8 px-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tenues Favorites</h1>
        <FavoriteOutfits />
      </div>
    </div>
  );
};

export default Favorites;