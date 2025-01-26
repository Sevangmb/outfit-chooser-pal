import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shirt, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClothingTab } from "@/components/ClothingTab";

const Closet = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClothes();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8 px-4 mx-auto mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Ma Garde-robe</h1>
          <Button 
            onClick={() => navigate("/add")}
            variant="default"
            className="gap-2"
          >
            <Shirt className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
        <ClothingTab showFriendsClothes={false} />
      </div>
    </div>
  );
};

export default Closet;