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
  console.log("Rendering ClothingCard with image:", image);

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
  
  // Log pour le débogage
  if (image) {
    console.log("Image content type:", getContentType(image));
    
    fetch(image)
      .then(response => {
        console.log("Image response:", {
          contentType: response.headers.get('content-type'),
          status: response.status,
          url: response.url
        });
      })
      .catch(error => {
        console.error("Error fetching image:", error);
      });
  }

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