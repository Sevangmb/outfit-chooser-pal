import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shirt } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ClothingCardProps {
  image?: string;
  name: string;
  category: string;
  color: string;
}

export const ClothingCard = ({ image, name, category, color }: ClothingCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <AspectRatio ratio={4/3}>
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Shirt className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-medium mb-1">{name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{category}</span>
          <span>•</span>
          <span>{color}</span>
        </div>
      </CardContent>
    </Card>
  );
};