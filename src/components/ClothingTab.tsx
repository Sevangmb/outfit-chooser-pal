import { AddClothingDialog } from "./AddClothingDialog";
import { ClothingSection } from "./ClothingSection";
import { ShopSection } from "./shop/ShopSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchAndFilters } from "./SearchAndFilters";
import { useState, useMemo } from "react";
import { SuitcaseDialog } from "./suitcase/SuitcaseDialog";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
  user_id: string;
  is_for_sale?: boolean;
}

interface ClothingTabProps {
  clothes: Clothing[];
  showFriendsClothes?: boolean;
}

export const ClothingTab = ({ showFriendsClothes = false }: ClothingTabProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [forSaleFilter, setForSaleFilter] = useState<boolean | null>(null);

  const { data: clothes = [], isLoading } = useQuery({
    queryKey: ["userClothes", sourceFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      let query = supabase.from("clothes").select("*");

      // Apply source filter
      if (sourceFilter === "me") {
        query = query.eq("user_id", user.id);
      } else if (sourceFilter === "friends") {
        const { data: friendships } = await supabase
          .from("friendships")
          .select("friend_id")
          .eq("user_id", user.id)
          .eq("status", "accepted");

        const friendIds = friendships?.map(f => f.friend_id) || [];
        if (friendIds.length > 0) {
          query = query.in("user_id", friendIds);
        }
      } else if (sourceFilter === "shops") {
        const { data: shopProfiles } = await supabase
          .from("shop_profiles")
          .select("user_id")
          .eq("status", "active");

        const shopUserIds = shopProfiles?.map(s => s.user_id) || [];
        if (shopUserIds.length > 0) {
          query = query.in("user_id", shopUserIds);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching clothes:", error);
        return [];
      }

      console.log("Fetched clothes:", data);
      return data || [];
    }
  });

  const filteredClothes = useMemo(() => {
    return clothes.filter((item) => {
      const matchesSearch = searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory = categoryFilter
        ? item.category.toLowerCase().includes(categoryFilter.toLowerCase())
        : true;

      const matchesColor = colorFilter
        ? item.color.toLowerCase() === colorFilter.toLowerCase()
        : true;

      const matchesForSale = forSaleFilter !== null
        ? item.is_for_sale === forSaleFilter
        : true;

      return matchesSearch && matchesCategory && matchesColor && matchesForSale;
    });
  }, [clothes, searchQuery, categoryFilter, colorFilter, forSaleFilter]);

  const tops = filteredClothes.filter(item => 
    item.category.toLowerCase().includes("haut") || 
    item.category.toLowerCase().includes("t-shirt") ||
    item.category.toLowerCase().includes("chemise") ||
    item.category.toLowerCase().includes("pull")
  );

  const bottoms = filteredClothes.filter(item => 
    item.category.toLowerCase().includes("bas") || 
    item.category.toLowerCase().includes("pantalon") ||
    item.category.toLowerCase().includes("jean") ||
    item.category.toLowerCase().includes("short")
  );

  const shoes = filteredClothes.filter(item => 
    item.category.toLowerCase().includes("chaussure") || 
    item.category.toLowerCase().includes("basket") ||
    item.category.toLowerCase().includes("botte")
  );

  const handleReset = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setColorFilter("");
    setSourceFilter("");
    setForSaleFilter(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chargement de votre garde-robe...</p>
      </div>
    );
  }

  return (
    <>
      {clothes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {showFriendsClothes 
              ? "Aucun vêtement partagé par vos amis"
              : "Aucun vêtement dans votre garde-robe"}
          </p>
          {!showFriendsClothes && <AddClothingDialog />}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SearchAndFilters
              onSearch={setSearchQuery}
              onFilterCategory={setCategoryFilter}
              onFilterColor={setColorFilter}
              onFilterSource={setSourceFilter}
              onFilterForSale={setForSaleFilter}
              onReset={handleReset}
            />
            <div className="flex gap-2">
              <AddClothingDialog />
              <SuitcaseDialog />
            </div>
          </div>
          <div className={`space-y-8 ${isMobile ? 'px-2' : ''}`}>
            <ClothingSection title="Hauts" items={tops} isMobile={isMobile} />
            <ClothingSection title="Bas" items={bottoms} isMobile={isMobile} />
            <ClothingSection title="Chaussures" items={shoes} isMobile={isMobile} />
          </div>
          
          {!showFriendsClothes && (
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Ma Boutique</h2>
              <ShopSection />
            </div>
          )}
        </div>
      )}
    </>
  );
};