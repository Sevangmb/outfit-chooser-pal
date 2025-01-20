import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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

interface OutfitDetailsProps {
  outfit: Outfit;
}

export const OutfitDetails = ({ outfit }: OutfitDetailsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AspectRatio ratio={4/3}>
            {outfit.clothes[0]?.clothes.image ? (
              <img
                src={outfit.clothes[0].clothes.image}
                alt={outfit.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center rounded-lg">
                Pas d'image
              </div>
            )}
          </AspectRatio>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">
              {outfit.description || "Aucune description"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Créé par</h3>
            <p className="text-sm text-muted-foreground">
              {outfit.user_email || "Utilisateur inconnu"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Vêtements</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-2">
                {outfit.clothes.map((item) => (
                  <div
                    key={item.clothes.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.clothes.category}</Badge>
                      <span className="text-sm">{item.clothes.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.clothes.color}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};