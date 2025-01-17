import { AddClothingDialog } from "./AddClothingDialog";
import { ClothingSection } from "./ClothingSection";

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
}

export const ClothingTab = ({ clothes }: ClothingTabProps) => {
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
          <p className="text-muted-foreground mb-4">Aucun vêtement dans votre garde-robe</p>
          <AddClothingDialog />
        </div>
      ) : (
        <div className="space-y-8">
          <ClothingSection title="Hauts" items={tops} />
          <ClothingSection title="Bas" items={bottoms} />
          <ClothingSection title="Chaussures" items={shoes} />
        </div>
      )}
    </>
  );
};