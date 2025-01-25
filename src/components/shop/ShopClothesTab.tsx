import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Euro } from "lucide-react";

interface ShopClothesTabProps {
  shopId: string;
}

export const ShopClothesTab = ({ shopId }: ShopClothesTabProps) => {
  const { data: clothes = [], isLoading } = useQuery({
    queryKey: ["shopClothes", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("is_for_sale", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching clothes for sale:", error);
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (clothes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun vêtement en vente pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {clothes.map((item) => (
        <Card key={item.id}>
          {item.image && (
            <div className="aspect-square relative overflow-hidden rounded-t-lg">
              <img
                src={item.image}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-lg">{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{item.selling_price}€</span>
            </div>
            {item.brand && (
              <div className="text-sm text-muted-foreground">
                {item.brand}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};