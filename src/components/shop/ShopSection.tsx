import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateShopDialog } from "./CreateShopDialog";
import { ShopProfileCard } from "./ShopProfileCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopClothesTab } from "./ShopClothesTab";
import { ShopLocationTab } from "./ShopLocationTab";

export const ShopSection = () => {
  const { data: shopProfile, isLoading } = useQuery({
    queryKey: ["shopProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("shop_profiles")
        .select("*, shop_profile_categories(category_id, shop_categories(name))")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching shop profile:", error);
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

  return (
    <div className="space-y-4">
      {shopProfile ? (
        <div className="space-y-6">
          <ShopProfileCard shop={shopProfile} />
          <Tabs defaultValue="clothes" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="clothes" className="flex-1">Vêtements en vente</TabsTrigger>
              <TabsTrigger value="location" className="flex-1">Localisation</TabsTrigger>
            </TabsList>
            <TabsContent value="clothes">
              <ShopClothesTab shopId={shopProfile.id} />
            </TabsContent>
            <TabsContent value="location">
              <ShopLocationTab shop={shopProfile} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">
            Vous n'avez pas encore de profil boutique
          </p>
          <CreateShopDialog />
        </div>
      )}
    </div>
  );
};