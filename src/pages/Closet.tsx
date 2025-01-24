import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shirt, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClothingTab } from "@/components/ClothingTab";

const Closet = () => {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const { data: userClothes, error } = await supabase
          .from('clothes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching clothes:', error);
          return;
        }

        setClothes(userClothes || []);
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

  if (clothes.length === 0) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="container py-8 px-4 mx-auto mt-16">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="rounded-full bg-accent/10 p-6">
              <Shirt className="h-12 w-12 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Votre garde-robe est vide</h1>
            <p className="text-muted-foreground max-w-md">
              Ajoutez vos vêtements préférés à votre garde-robe pour commencer à créer des tenues uniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate("/add")}
                variant="default"
                className="gap-2"
              >
                <Shirt className="h-4 w-4" />
                Ajouter des vêtements
              </Button>
              <Button 
                onClick={() => navigate("/discover")}
                variant="outline"
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Explorer les tenues
              </Button>
            </div>
          </div>
        </div>
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
        <ClothingTab clothes={clothes} />
      </div>
    </div>
  );
};

export default Closet;