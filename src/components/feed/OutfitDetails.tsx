import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

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

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_email: string;
}

interface OutfitDetailsProps {
  outfit: Outfit;
}

export const OutfitDetails = ({ outfit }: OutfitDetailsProps) => {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["outfit-comments", outfit.id],
    queryFn: async () => {
      console.log("Fetching comments for outfit:", outfit.id);
      const { data: comments, error } = await supabase
        .from("outfit_comments")
        .select(`
          id,
          content,
          created_at,
          profiles!inner(email)
        `)
        .eq("outfit_id", outfit.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      return comments.map((comment: any) => ({
        ...comment,
        user_email: comment.profiles.email,
      }));
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!newComment.trim()) {
        throw new Error("Le commentaire ne peut pas être vide");
      }

      const { error } = await supabase
        .from("outfit_comments")
        .insert({ outfit_id: outfit.id, content: newComment.trim() });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfit-comments", outfit.id] });
      setNewComment("");
      toast.success("Commentaire ajouté !");
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast.error("Erreur lors de l'ajout du commentaire");
    },
  });

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AspectRatio ratio={4/3}>
            {outfit.clothes[0]?.clothes.image ? (
              <img
                src={outfit.clothes[0].clothes.image}
                alt={outfit.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center rounded-lg">
                Pas d'image
              </div>
            )}
          </AspectRatio>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">
              {outfit.description || "Aucune description"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Créé par</h3>
            <p className="text-sm text-muted-foreground">
              {outfit.user_email || "Utilisateur inconnu"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Vêtements</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-2">
                {outfit.clothes.map((item) => (
                  <div
                    key={item.clothes.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.clothes.category}</Badge>
                      <span className="text-sm">{item.clothes.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.clothes.color}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="mt-6">
        <h3 className="font-semibold mb-4">Commentaires</h3>
        
        {/* Add comment form */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Ajouter un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addCommentMutation.mutate();
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => addCommentMutation.mutate()}
            disabled={addCommentMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments list */}
        <ScrollArea className="h-[300px] rounded-md border p-4">
          {isLoadingComments ? (
            <div className="text-center text-muted-foreground">
              Chargement des commentaires...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Aucun commentaire pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {comment.user_email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};