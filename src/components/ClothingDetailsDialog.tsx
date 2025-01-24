import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Shirt, Twitter, Facebook, Linkedin } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClothingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clothingId: number;
}

export const ClothingDetailsDialog = ({ isOpen, onClose, clothingId }: ClothingDetailsDialogProps) => {
  const [clothing, setClothing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchClothingDetails = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: clothingData, error } = await supabase
          .from('clothes')
          .select('*')
          .eq('id', clothingId)
          .single();

        if (error) throw error;

        setClothing(clothingData);
        setIsOwner(session?.user?.id === clothingData.user_id);
      } catch (error) {
        console.error('Error fetching clothing details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && clothingId) {
      fetchClothingDetails();
    }
  }, [isOpen, clothingId]);

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `Découvrez ce ${clothing?.name} sur Lovable!`;
    
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
        title: clothing?.name,
        text: shareText,
        url: shareUrl,
      }).catch((error) => {
        console.error('Error sharing:', error);
        toast.error("Erreur lors du partage");
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // TODO: Implement edit functionality
    toast.info("La fonctionnalité de modification sera bientôt disponible");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span>{clothing?.name || 'Détails du vêtement'}</span>
            <div className="flex gap-2">
              {isOwner && (
                <Button variant="outline" size="sm" className="gap-2" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>
              )}
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="h-4 w-4 text-muted-foreground hover:text-[#1DA1F2]" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="h-4 w-4 text-muted-foreground hover:text-[#4267B2]" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                >
                  <Linkedin className="h-4 w-4 text-muted-foreground hover:text-[#0077B5]" />
                </Button>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : clothing ? (
          <div className="grid gap-6">
            <AspectRatio ratio={4/3}>
              {clothing.image ? (
                <img
                  src={clothing.image}
                  alt={clothing.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-secondary/30 flex items-center justify-center rounded-lg">
                  <Shirt className="w-16 h-16 text-primary/40" />
                </div>
              )}
            </AspectRatio>

            <div className="grid gap-4">
              <div>
                <h3 className="font-medium mb-2">Informations générales</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Catégorie</div>
                  <div>{clothing.category}</div>
                  {clothing.subcategory && (
                    <>
                      <div className="text-muted-foreground">Sous-catégorie</div>
                      <div>{clothing.subcategory}</div>
                    </>
                  )}
                  {clothing.brand && (
                    <>
                      <div className="text-muted-foreground">Marque</div>
                      <div>{clothing.brand}</div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Caractéristiques</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{clothing.color}</Badge>
                  {clothing.secondary_color && (
                    <Badge variant="secondary">{clothing.secondary_color}</Badge>
                  )}
                  {clothing.size && <Badge variant="secondary">{clothing.size}</Badge>}
                  {clothing.material && (
                    <Badge variant="secondary">{clothing.material}</Badge>
                  )}
                </div>
              </div>

              {clothing.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{clothing.notes}</p>
                </div>
              )}

              {clothing.is_for_sale && (
                <div>
                  <h3 className="font-medium mb-2">Informations de vente</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {clothing.purchase_price && (
                      <>
                        <div className="text-muted-foreground">Prix d'achat</div>
                        <div>{clothing.purchase_price}€</div>
                      </>
                    )}
                    {clothing.selling_price && (
                      <>
                        <div className="text-muted-foreground">Prix de vente</div>
                        <div>{clothing.selling_price}€</div>
                      </>
                    )}
                    {clothing.location && (
                      <>
                        <div className="text-muted-foreground">Emplacement</div>
                        <div>{clothing.location}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            Vêtement non trouvé
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};