import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image: string | null;
}

interface OutfitCardProps {
  outfit: {
    id: number;
    name: string;
    description: string | null;
    user_email?: string;
    clothes: Clothing[];
  };
}

export const OutfitCard = ({ outfit }: OutfitCardProps) => (
  <Card className="w-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex flex-col">
        <h3 className="font-semibold">{outfit.name}</h3>
        {outfit.user_email && (
          <p className="text-sm text-muted-foreground">Par {outfit.user_email}</p>
        )}
      </div>
      <Star className="h-4 w-4 fill-primary text-primary" />
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {outfit.clothes.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm"
          >
            <span>{item.name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{item.color}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);