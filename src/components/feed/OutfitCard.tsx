import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, MoreVertical } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OutfitDetails } from "./OutfitDetails";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const checkSupabaseConnection = () => {
  if (!supabase) {
    console.error("Supabase client is not initialized.");
    toast.error("Erreur de connexion à la base de données. Veuillez réessayer plus tard.");
    return false;
  }
  return true;
};

export const OutfitCard = ({ outfit }: OutfitCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const queryClient = useQueryClient();

  const { data: commentCount = 0 } = useQuery({
    queryKey: ["outfit-comment-count", outfit.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("outfit_comments")
        .select("*", { count: "exact", head: true })
        .eq("outfit_id", outfit.id);

      if (error) {
        console.error("Unexpected error occurred while voting:", error);
        toast.error("Une erreur inattendue est survenue lors du vote. Veuillez réessayer plus tard.");
        return;
      }
      return count || 0;
    },
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (!checkSupabaseConnection()) return;
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

  const handleReport = async () => {
    if (!checkSupabaseConnection()) return;
    const { error } = await supabase
      .from("outfits")
      .update({ is_flagged: true })
      .eq("id", outfit.id);

    if (error) {
      console.error("Error reporting content:", error);
      console.error("Unexpected error occurred while reporting content:", error);
      toast.error("Une erreur inattendue est survenue lors du signalement. Veuillez réessayer plus tard.");
      return;
    }
    toast.success("Contenu signalé");
  };

  const handleHide = () => {
    // À implémenter : logique pour masquer le post
    toast.success("Publication masquée");
  };

  const handleUnfollow = async () => {
    const { error } = await supabase
      .from("followers")
      .delete()
      .eq("following_id", outfit.user_id);

    if (error) {
      toast.error("Erreur lors du désabonnement");
    } else {
      toast.success("Vous ne suivez plus cet utilisateur");
    }
  };

  const mainImage = outfit.clothes[0]?.clothes.image || null;
  const timeAgo = formatDistanceToNow(new Date(outfit.created_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="p-4 space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://avatar.vercel.sh/${outfit.user_email}`} />
                <AvatarFallback>
                  {outfit.user_email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hover:underline cursor-pointer">
                {outfit.user_email}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReport}>
                  Signaler le contenu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHide}>
                  Masquer cette publication
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUnfollow}>
                  Ne plus suivre
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AspectRatio ratio={4/3}>
            {mainImage ? (
              <>
                {!isImageLoaded && (
                  <div className="w-full h-full bg-secondary/30 animate-pulse" />
                )}
                <img
                  src={`${mainImage}?quality=75&width=600`}
                  alt={outfit.name}
                  className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onClick={() => setIsDetailsOpen(true)}
                  onLoad={() => setIsImageLoaded(true)}
                  loading="lazy"
                />
              </>
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                Pas d'image
              </div>
            )}
          </AspectRatio>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{outfit.name}</h3>
            {outfit.description && (
              <p className="text-muted-foreground text-sm mb-2">{outfit.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
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
            <span>{commentCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
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