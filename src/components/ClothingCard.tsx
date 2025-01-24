import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shirt } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect } from "react";

interface ClothingCardProps {
  image?: string;
  name: string;
  category: string;
  color: string;
}

export const ClothingCard = ({ image, name, category, color }: ClothingCardProps) => {
  console.log("Rendering ClothingCard with image:", image);

  useEffect(() => {
    if (image) {
      // Vérifie l'URL de l'image au montage du composant
      validateImageUrl(image);
    }
  }, [image]);

  const validateImageUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      console.log("Image validation response:", {
        url,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      if (!response.ok) {
        console.error("Invalid image URL:", {
          url,
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      console.error("Error validating image URL:", {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  // Détermine le type de contenu en fonction de l'URL
  const getContentType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return null;
    }
  };

  // Vérifie si l'URL de l'image est valide
  const isValidImageUrl = image && getContentType(image);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-secondary/50 hover:border-primary/30 bg-background/50 backdrop-blur-sm">
      <CardHeader className="p-0">
        <AspectRatio ratio={4/3}>
          {isValidImageUrl ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover bg-secondary/30"
              loading="lazy"
              decoding="async"
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
              onError={(e) => {
                console.error("Image load error:", e);
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = "placeholder.svg";
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