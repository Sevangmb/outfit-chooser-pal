import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, Shirt } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClothingDetailsDialog } from "./ClothingDetailsDialog";
import { toast } from "sonner";

interface ClothingCardProps {
  id: number;
  image?: string;
  name: string;
  category: string;
  color: string;
}

export const ClothingCard = ({ id, image, name, category, color }: ClothingCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  useEffect(() => {
    if (!image) {
      console.log("No image provided for clothing item:", name);
      setIsLoading(false);
      return;
    }

    // Reset states when image URL changes
    setImageError(false);
    setIsLoading(true);

    const img = new Image();
    img.src = image;

    img.onload = () => {
      console.log("Image loaded successfully:", image);
      setIsLoading(false);
      setImageError(false);
    };

    img.onerror = (error) => {
      console.error("Image failed to load:", image, error);
      setIsLoading(false);
      setImageError(true);
      toast.error(`Erreur de chargement de l'image pour ${name}`);
    };

    // Verify image content type and accessibility
    const verifyImage = async () => {
      try {
        const response = await fetch(image, { method: 'HEAD' });
        if (!response.ok) {
          console.error("Image URL is not accessible:", image, response.status);
          setImageError(true);
          toast.error(`Image inaccessible pour ${name}`);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.startsWith('image/')) {
          console.error("Invalid content type for image:", contentType);
          setImageError(true);
          toast.error(`Type de contenu invalide pour l'image de ${name}`);
        }
      } catch (error) {
        console.error("Error verifying image:", image, error);
        setImageError(true);
      }
    };

    verifyImage();

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [image, name]);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-secondary/50 hover:border-primary/30 bg-background/50 backdrop-blur-sm">
        <CardHeader className="p-0">
          <AspectRatio ratio={4/3}>
            {image && !imageError ? (
              <div className="relative w-full h-full">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                <img
                  src={image}
                  alt={name}
                  className={`w-full h-full object-cover bg-secondary/30 transition-opacity duration-300 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    console.error("Image error event triggered for:", image);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                <Shirt className="w-16 h-16 text-primary/40" />
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium mb-1 text-primary">{name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{category}</span>
                <span>•</span>
                <span>{color}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setIsDetailsOpen(true)}
            >
              <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ClothingDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        clothingId={id}
      />
    </>
  );
};