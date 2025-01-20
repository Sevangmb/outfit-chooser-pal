import { useState } from "react";
import { ClothingCarousel } from "./outfit/ClothingCarousel";
import { SaveOutfitButton } from "./outfit/SaveOutfitButton";
import { OutfitCanvas } from "./outfit/OutfitCanvas";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
  user_id: string;
}

interface OutfitCreatorProps {
  clothes: Clothing[];
}

export const OutfitCreator = ({ clothes }: OutfitCreatorProps) => {
  const [selectedTop, setSelectedTop] = useState<number | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<number | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<number | null>(null);

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
    <div className="grid md:grid-cols-2 gap-8 py-8">
      <div className="space-y-8">
        <ClothingCarousel
          items={tops}
          selectedId={selectedTop}
          onSelect={setSelectedTop}
          title="Haut"
        />

        <ClothingCarousel
          items={bottoms}
          selectedId={selectedBottom}
          onSelect={setSelectedBottom}
          title="Bas"
        />

        <ClothingCarousel
          items={shoes}
          selectedId={selectedShoes}
          onSelect={setSelectedShoes}
          title="Chaussures"
        />

        <div className="flex justify-center pt-4">
          <SaveOutfitButton
            selectedTop={selectedTop}
            selectedBottom={selectedBottom}
            selectedShoes={selectedShoes}
          />
        </div>
      </div>

      <div className="sticky top-24">
        <OutfitCanvas
          selectedTop={selectedTop}
          selectedBottom={selectedBottom}
          selectedShoes={selectedShoes}
          clothes={clothes}
        />
      </div>
    </div>
  );
};