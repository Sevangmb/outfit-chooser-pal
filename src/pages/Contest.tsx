import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface Outfit {
  id: number;
  name: string;
  description: string | null;
  user_id: string;
  rating: number;
  clothes: {
    clothes: {
      id: number;
      name: string;
      category: string;
      color: string;
      image: string | null;
    };
  }[];
}

const Contest = () => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: outfits = [], isLoading } = useQuery({
    queryKey: ["contest-outfits"],
    queryFn: async () => {
      console.log("Fetching contest outfits...");
      const { data: outfits, error } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes:clothes(id, name, category, color, image)
          )
        `)
        .order("rating", { ascending: false });

      if (error) {
        console.error("Error fetching outfits:", error);
        throw error;
      }

      console.log("Fetched outfits:", outfits);
      return outfits as Outfit[];
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (outfitId: number) => {
      const { error } = await supabase
        .from("outfit_votes")
        .insert({ outfit_id: outfitId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest-outfits"] });
      toast.success("Vote enregistré !");
      // Passer à l'ensemble suivant
      if (currentIndex < outfits.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast.info("Vous avez vu tous les ensembles !");
        setCurrentIndex(0);
      }
    },
    onError: (error) => {
      console.error("Error voting:", error);
      toast.error("Erreur lors du vote");
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: async (outfitId: number) => {
      const { error } = await supabase
        .from("outfit_votes")
        .delete()
        .eq("outfit_id", outfitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest-outfits"] });
      toast.success("Vote retiré !");
      // Passer à l'ensemble suivant
      if (currentIndex < outfits.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast.info("Vous avez vu tous les ensembles !");
        setCurrentIndex(0);
      }
    },
    onError: (error) => {
      console.error("Error removing vote:", error);
      toast.error("Erreur lors du retrait du vote");
    },
  });

  const sortClothes = (outfit: Outfit) => {
    const sorted = {
      haut: outfit.clothes.find(c => c.clothes.category === "haut"),
      bas: outfit.clothes.find(c => c.clothes.category === "bas"),
      chaussure: outfit.clothes.find(c => c.clothes.category === "chaussure"),
    };
    return sorted;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="container py-8 mt-16">
          <div className="text-center text-primary animate-pulse">
            Chargement du concours...
          </div>
        </div>
      </div>
    );
  }

  if (!outfits.length) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="container py-8 mt-16">
          <div className="text-center text-primary">
            Aucun ensemble à noter pour le moment
          </div>
        </div>
      </div>
    );
  }

  const currentOutfit = outfits[currentIndex];
  const sortedClothes = sortClothes(currentOutfit);

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8 mt-16">
        <h1 className="text-2xl font-bold text-primary mb-8 text-center">
          Concours des plus beaux ensembles
        </h1>

        <div className="max-w-md mx-auto">
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">{currentOutfit.name}</h3>
                {currentOutfit.description && (
                  <p className="text-muted-foreground">{currentOutfit.description}</p>
                )}
                <div className="text-lg font-semibold text-primary mt-2">
                  {currentOutfit.rating} votes
                </div>
              </div>

              <div className="space-y-4">
                {/* Haut */}
                <div className="aspect-[4/3] relative rounded-md overflow-hidden bg-secondary/30">
                  {sortedClothes.haut?.clothes.image ? (
                    <img
                      src={sortedClothes.haut.clothes.image}
                      alt={sortedClothes.haut.clothes.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      Pas d'image
                    </div>
                  )}
                </div>

                {/* Bas */}
                <div className="aspect-[4/3] relative rounded-md overflow-hidden bg-secondary/30">
                  {sortedClothes.bas?.clothes.image ? (
                    <img
                      src={sortedClothes.bas.clothes.image}
                      alt={sortedClothes.bas.clothes.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      Pas d'image
                    </div>
                  )}
                </div>

                {/* Chaussures */}
                <div className="aspect-[4/3] relative rounded-md overflow-hidden bg-secondary/30">
                  {sortedClothes.chaussure?.clothes.image ? (
                    <img
                      src={sortedClothes.chaussure.clothes.image}
                      alt={sortedClothes.chaussure.clothes.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      Pas d'image
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => voteMutation.mutate(currentOutfit.id)}
                  className="w-full"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  J'aime
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => unvoteMutation.mutate(currentOutfit.id)}
                  className="w-full"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Je n'aime pas
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Ensemble {currentIndex + 1} sur {outfits.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contest;
