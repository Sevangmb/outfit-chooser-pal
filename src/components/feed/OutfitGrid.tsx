import { OutfitCard } from "./OutfitCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Outfit {
  id: number;
  name: string;
  description: string | null;
  user_id: string;
  rating: number;
  created_at: string;
  user_email?: string;
  clothes: {
    clothes: {
      id: number;
      name: string;
      category: string;
      color: string;
      image: string | null;
    };
  }[];
}

interface OutfitGridProps {
  outfits: Outfit[];
  isFetchingNextPage: boolean;
  observerRef: (node?: Element | null) => void;
}

export const OutfitGrid = ({ outfits, isFetchingNextPage, observerRef }: OutfitGridProps) => {
  console.log("Rendering OutfitGrid with outfits:", outfits);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
      
      <div ref={observerRef}>
        {isFetchingNextPage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};