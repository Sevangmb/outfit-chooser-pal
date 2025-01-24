import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shirt } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";

interface ClothingCardProps {
  image?: string;
  name: string;
  category: string;
  color: string;
}

export const ClothingCard = ({ image, name, category, color }: ClothingCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isValidatingImage, setIsValidatingImage] = useState(true);
  
  console.log("Rendering ClothingCard with image:", image);

  useEffect(() => {
    if (image) {
      validateImageUrl(image);
    } else {
      setIsValidatingImage(false);
    }
  }, [image]);

  const validateImageUrl = async (url: string) => {
    try {
      setIsValidatingImage(true);
      
      // Create a new Image object to test loading
      const img = new Image();
      img.src = url;
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log("Image loaded successfully:", {
            url,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          });
          resolve(true);
        };
        img.onerror = () => {
          console.error("Image failed to load:", url);
          reject(new Error("Image failed to load"));
        };
      });

      setImageError(false);
    } catch (error) {
      console.error("Error validating image URL:", {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      setImageError(true);
    } finally {
      setIsValidatingImage(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-secondary/50 hover:border-primary/30 bg-background/50 backdrop-blur-sm">
      <CardHeader className="p-0">
        <AspectRatio ratio={4/3}>
          {image && !imageError && !isValidatingImage ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover bg-secondary/30"
              loading="lazy"
              decoding="async"
              onError={() => {
                console.error("Image load error for:", image);
                setImageError(true);
              }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                console.log("Image loaded successfully:", {
                  src: img.src,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                  displayWidth: img.width,
                  displayHeight: img.height,
                  currentSrc: img.currentSrc
                });
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