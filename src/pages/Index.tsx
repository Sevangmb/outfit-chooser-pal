import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { OutfitFeed } from "@/components/feed/OutfitFeed";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <Header onLogout={handleLogout} className="container py-8 mt-16" />

      <div className="container py-8 px-4 mx-auto">
        <OutfitFeed />
      </div>
    </div>
  );
};

export default Index;