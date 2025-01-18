import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, StarOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
  user_id: string;
}

export const OutfitCreator = () => {
  const [selectedTop, setSelectedTop] = useState<number | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<number | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<number | null>(null);

  const { data: clothes = [] } = useQuery({
    queryKey: ["clothes"],
    queryFn: async () => {
      console.log("Fetching clothes...");
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching clothes:", error);
        throw error;
      }

      console.log("Fetched clothes:", data);
      return data;
    },
  });

  const tops = clothes.filter(item => 
    item.category.toLowerCase().includes("haut") || 
    item.category.toLowerCase().includes("t-shirt") ||
    item.category.toLowerCase().includes("chemise") ||
    item.category.toLowerCase().includes("pull")
  );

  const bottoms = clothes.filter(item => 
    item.category.toLowerCase().includes("bas") || 
    item.category.toLowerCase().includes("pantalon") ||
    item.category.toLowerCase().includes("jean") ||
    item.category.toLowerCase().includes("short")
  );

  const shoes = clothes.filter(item => 
    item.category.toLowerCase().includes("chaussure") || 
    item.category.toLowerCase().includes("basket") ||
    item.category.toLowerCase().includes("botte")
  );

  const saveOutfit = async () => {
    if (!selectedTop || !selectedBottom || !selectedShoes) {
      toast.error("Veuillez sélectionner un vêtement pour chaque catégorie");
      return;
    }

    try {
      // Create the outfit
      const { data: outfit, error: outfitError } = await supabase
        .from("outfits")
        .insert([
          { 
            name: "Mon ensemble",
            is_favorite: true 
          }
        ])
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Add clothes to the outfit
      const { error: clothesError } = await supabase
        .from("outfit_clothes")
        .insert([
          { outfit_id: outfit.id, clothes_id: selectedTop },
          { outfit_id: outfit.id, clothes_id: selectedBottom },
          { outfit_id: outfit.id, clothes_id: selectedShoes }
        ]);

      if (clothesError) throw clothesError;

      toast.success("Ensemble enregistré dans vos favoris !");
    } catch (error) {
      console.error("Error saving outfit:", error);
      toast.error("Erreur lors de l'enregistrement de l'ensemble");
    }
  };

  const renderClothingCarousel = (items: Clothing[], selectedId: number | null, setSelectedId: (id: number) => void) => (
    <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.id}>
            <div 
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedId === item.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedId(item.id)}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );

  return (
    <div className="space-y-8 py-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Haut</h3>
        {renderClothingCarousel(tops, selectedTop, setSelectedTop)}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Bas</h3>
        {renderClothingCarousel(bottoms, selectedBottom, setSelectedBottom)}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Chaussures</h3>
        {renderClothingCarousel(shoes, selectedShoes, setSelectedShoes)}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={saveOutfit}
          className="gap-2"
          variant="outline"
        >
          <Star className="w-4 h-4" />
          Enregistrer en favori
        </Button>
      </div>
    </div>
  );
};