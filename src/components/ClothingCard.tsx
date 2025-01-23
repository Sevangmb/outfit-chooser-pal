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
  console.log("Rendering ClothingCard with image:", image); // Debug log

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-secondary/50 hover:border-primary/30 bg-background/50 backdrop-blur-sm">
      <CardHeader className="p-0">
        <AspectRatio ratio={4/3}>
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain bg-secondary/30"
              onError={(e) => {
                console.error("Image load error:", e);
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = "placeholder.svg"; // Fallback to placeholder if image fails to load
              }}
            />
          ) : (
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
              <Shirt className="w-16 h-16 text-primary/40" />
            </div>
          )}
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-medium mb-1 text-primary">{name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{category}</span>
          <span>•</span>
          <span>{color}</span>
        </div>
      </CardContent>
    </Card>
  );
};