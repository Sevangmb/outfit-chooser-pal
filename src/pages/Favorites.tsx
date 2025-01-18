import { Header } from "@/components/Header";
import { MobileHeader } from "@/components/MobileHeader";
import { FavoriteOutfits } from "@/components/FavoriteOutfits";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      <MobileHeader onLogout={handleLogout} />
      <Header onLogout={handleLogout} className="hidden md:block container py-8" />

      <div className="container py-8 px-4 mx-auto mt-16 md:mt-0">
        <h1 className="text-2xl font-bold mb-6">Tenues Favorites</h1>
        <FavoriteOutfits />
      </div>
    </div>
  );
};

export default Favorites;