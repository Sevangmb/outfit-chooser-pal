import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateShopDialog } from "./CreateShopDialog";
import { ShopProfileCard } from "./ShopProfileCard";

export const ShopSection = () => {
  const { data: shopProfile, isLoading } = useQuery({
    queryKey: ["shopProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("shop_profiles")
        .select("*")
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
        <ShopProfileCard shop={shopProfile} />
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