import { AddClothingDialog } from "./AddClothingDialog";
import { ClothingSection } from "./ClothingSection";
import { useIsMobile } from "@/hooks/use-mobile";

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

export const ClothingTab = ({ clothes, showFriendsClothes = false }: ClothingTabProps) => {
  const isMobile = useIsMobile();

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