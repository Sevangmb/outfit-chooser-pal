import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, List } from "lucide-react";
import { ShopLocationTab } from "./ShopLocationTab";
import { ShopProfileCard } from "./ShopProfileCard";
import { Skeleton } from "@/components/ui/skeleton";

export const ShopSection = () => {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const { data: shops, isLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      console.log("Fetching shops...");
      const { data, error } = await supabase
        .from("shop_profiles")
        .select(`
          *,
          shop_profile_categories (
            shop_categories (
              name
            )
          )
        `)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching shops:", error);
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Boutiques</h2>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "map" | "list")} className="w-auto">
          <TabsList>
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="h-4 w-4" />
              Carte
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Liste
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "map" && shops && shops.length > 0 && (
        <ShopLocationTab shop={shops[0]} />
      )}

      {viewMode === "list" && (
        <div className="grid gap-4 md:grid-cols-2">
          {shops?.map((shop) => (
            <ShopProfileCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}

      {shops?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune boutique disponible pour le moment
        </div>
      )}
    </div>
  );
};