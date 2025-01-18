import { ScrollArea } from "@/components/ui/scroll-area";
import { OutfitCard } from "./OutfitCard";

interface Outfit {
  id: number;
  name: string;
  description: string | null;
  user_email?: string;
  clothes: {
    id: number;
    name: string;
    category: string;
    color: string;
    image: string | null;
  }[];
}

interface FavoritesListProps {
  outfits: Outfit[];
  emptyMessage: string;
}

export const FavoritesList = ({ outfits, emptyMessage }: FavoritesListProps) => (
  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
    <div className="space-y-4">
      {outfits.length === 0 ? (
        <p className="text-center text-muted-foreground">{emptyMessage}</p>
      ) : (
        outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)
      )}
    </div>
  </ScrollArea>
);