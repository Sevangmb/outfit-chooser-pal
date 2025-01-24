import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shirt, Twitter, Facebook, Linkedin } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ClothingCardProps {
  image?: string;
  name: string;
  category: string;
  color: string;
}

export const ClothingCard = ({ image, name, category, color }: ClothingCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!image) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = image;

    img.onload = () => {
      console.log("Image loaded successfully:", image);
      setIsLoading(false);
      setImageError(false);
    };

    img.onerror = () => {
      console.error("Image failed to load:", image);
      setIsLoading(false);
      setImageError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [image]);

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `Découvrez ce ${name} sur Lovable!`;
    
    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    } else if (navigator.share) {
      navigator.share({
        title: name,
        text: shareText,
        url: shareUrl,
      }).catch((error) => {
        console.error('Error sharing:', error);
        toast.error("Erreur lors du partage");
      });
    }
  };

  return (
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
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-[#1DA1F2]" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="h-4 w-4 text-muted-foreground hover:text-[#4267B2]" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleShare('linkedin')}
            >
              <Linkedin className="h-4 w-4 text-muted-foreground hover:text-[#0077B5]" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};