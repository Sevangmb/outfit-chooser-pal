import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OutfitDetails } from "./OutfitDetails";

interface Outfit {
  id: number;
  name: string;
  description: string | null;
  user_id: string;
  rating: number;
  created_at: string;
  user_email?: string;
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

interface OutfitCardProps {
  outfit: Outfit;
}

export const OutfitCard = ({ outfit }: OutfitCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("outfit_votes")
        .insert({ outfit_id: outfit.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits-feed"] });
      toast.success("Vote enregistré !");
    },
    onError: (error) => {
      console.error("Error voting:", error);
      toast.error("Erreur lors du vote");
    },
  });

  const mainImage = outfit.clothes[0]?.clothes.image || null;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <AspectRatio ratio={4/3}>
            {mainImage ? (
              <img
                src={mainImage}
                alt={outfit.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsDetailsOpen(true)}
              />
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                Pas d'image
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">{outfit.name}</h3>
          {outfit.description && (
            <p className="text-muted-foreground text-sm mb-2">{outfit.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Par {outfit.user_email || "Utilisateur inconnu"}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => voteMutation.mutate()}
            className="flex items-center gap-1"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{outfit.rating}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailsOpen(true)}
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Détails</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Implement sharing functionality
              toast.info("Fonctionnalité de partage à venir");
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{outfit.name}</DialogTitle>
          </DialogHeader>
          <OutfitDetails outfit={outfit} />
        </DialogContent>
      </Dialog>
    </>
  );
};