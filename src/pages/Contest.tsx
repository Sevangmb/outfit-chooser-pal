import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

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
    },
    onError: (error) => {
      console.error("Error removing vote:", error);
      toast.error("Erreur lors du retrait du vote");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navigation />
        <div className="container py-8 mt-16">
          <div className="text-center text-primary animate-pulse">
            Chargement du concours...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <div className="container py-8 mt-16">
        <h1 className="text-2xl font-bold text-primary mb-8">
          Concours des plus beaux ensembles
        </h1>

        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          <div className="space-y-6">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-background/80 backdrop-blur-sm rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{outfit.name}</h3>
                    {outfit.description && (
                      <p className="text-muted-foreground">{outfit.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-primary">
                      {outfit.rating}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => voteMutation.mutate(outfit.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => unvoteMutation.mutate(outfit.id)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {outfit.clothes.map(({ clothes }) => (
                    <div
                      key={clothes.id}
                      className="aspect-[4/3] relative rounded-md overflow-hidden bg-secondary/30"
                    >
                      {clothes.image ? (
                        <img
                          src={clothes.image}
                          alt={clothes.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                          Pas d'image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Contest;