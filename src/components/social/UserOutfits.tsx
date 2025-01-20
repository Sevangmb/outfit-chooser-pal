import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";

interface UserOutfitsProps {
  userId: string;
}

export const UserOutfits = ({ userId }: UserOutfitsProps) => {
  const { data: outfits = [] } = useQuery({
    queryKey: ["userOutfits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outfits")
        .select(`
          *,
          outfit_votes(count),
          outfit_clothes(
            clothes(*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (outfits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune tenue créée pour le moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {outfits.map((outfit) => (
        <Card key={outfit.id} className="overflow-hidden group">
          <CardContent className="p-0 relative">
            <div className="aspect-square bg-secondary/30">
              {/* Placeholder for outfit preview */}
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Tenue #{outfit.id}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{outfit.outfit_votes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};