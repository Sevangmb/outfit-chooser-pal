import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, Shirt } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClothingDetailsDialog } from "./ClothingDetailsDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!image) {
      console.log("No image provided for clothing item:", name);
      setIsLoading(false);
      return;
    }

    // Reset states when image URL changes
    setImageError(false);
    setIsLoading(true);
    setImageUrl(null);

    const loadImage = async () => {
      try {
        // Try to get a fresh signed URL for the image
        if (image.includes('supabase.co')) {
          const path = image.split('/public/clothes/')[1];
          if (path) {
            const { data: { signedUrl }, error } = await supabase.storage
              .from('clothes')
              .createSignedUrl(path, 3600);

            if (error) {
              console.error("Error getting signed URL:", error);
              throw error;
            }

            if (signedUrl) {
              setImageUrl(signedUrl);
              return;
            }
          }
        }
        // Fallback to original URL if not a Supabase URL or if getting signed URL fails
        setImageUrl(image);
      } catch (error) {
        console.error("Error loading image:", error);
        setImageError(true);
        toast.error(`Erreur de chargement de l'image pour ${name}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [image, name]);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-secondary/50 hover:border-primary/30 bg-background/50 backdrop-blur-sm">
        <CardHeader className="p-0">
          <AspectRatio ratio={4/3}>
            {imageUrl && !imageError ? (
              <div className="relative w-full h-full">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={name}
                  className={`w-full h-full object-cover bg-secondary/30 transition-opacity duration-300 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    console.error("Image error event triggered for:", imageUrl);
                    setImageError(true);
                    setIsLoading(false);
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