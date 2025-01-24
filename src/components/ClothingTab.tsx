import { AddClothingDialog } from "./AddClothingDialog";
import { ClothingSection } from "./ClothingSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
  user_id: string;
}

interface ClothingTabProps {
  clothes: Clothing[];
  showFriendsClothes?: boolean;
}

export const ClothingTab = ({ showFriendsClothes = false }: ClothingTabProps) => {
  const isMobile = useIsMobile();

  const { data: clothes = [], isLoading } = useQuery({
    queryKey: ["userClothes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching clothes:", error);
        return [];
      }

      console.log("Fetched clothes for user:", user.id, data);
      return data || [];
    }
  });

  const tops = clothes.filter(item => 
    item.category.toLowerCase().includes("haut") || 
    item.category.toLowerCase().includes("t-shirt") ||
    item.category.toLowerCase().includes("chemise") ||
    item.category.toLowerCase().includes("pull")
  );

  const bottoms = clothes.filter(item => 
    item.category.toLowerCase().includes("bas") || 
    item.category.toLowerCase().includes("pantalon") ||
    item.category.toLowerCase().includes("jean") ||
    item.category.toLowerCase().includes("short")
  );

  const shoes = clothes.filter(item => 
    item.category.toLowerCase().includes("chaussure") || 
    item.category.toLowerCase().includes("basket") ||
    item.category.toLowerCase().includes("botte")
  );

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
        <div className={`space-y-8 ${isMobile ? 'px-2' : ''}`}>
          <ClothingSection title="Hauts" items={tops} isMobile={isMobile} />
          <ClothingSection title="Bas" items={bottoms} isMobile={isMobile} />
          <ClothingSection title="Chaussures" items={shoes} isMobile={isMobile} />
        </div>
      )}
    </>
  );
};