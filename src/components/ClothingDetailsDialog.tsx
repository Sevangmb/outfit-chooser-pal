import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ClothingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clothingId: number;
}

export const ClothingDetailsDialog = ({ isOpen, onClose, clothingId }: ClothingDetailsDialogProps) => {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [colorName, setColorName] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  
  const { data: clothing, isLoading } = useQuery({
    queryKey: ['clothing', clothingId],
    queryFn: async () => {
      console.log("Fetching clothing details for id:", clothingId);
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('id', clothingId)
        .single();

      if (error) {
        console.error("Error fetching clothing:", error);
        throw error;
      }

      console.log("Fetched clothing details:", data);
      return data;
    },
    enabled: isOpen && !!clothingId,
  });

  useEffect(() => {
    const checkOwnership = async () => {
      if (clothing) {
        const { data: { user } } = await supabase.auth.getUser();
        setIsOwner(clothing.user_id === user?.id);
      }
    };

    checkOwnership();
  }, [clothing]);

  useEffect(() => {
    const analyzeColor = async () => {
      if (clothing?.color && clothing.color.startsWith('#')) {
        try {
          const response = await fetch(
            'https://bjydiorocaixosezpylh.supabase.co/functions/v1/analyze-color',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ hexColor: clothing.color }),
            }
          );

          if (!response.ok) throw new Error('Failed to analyze color');

          const data = await response.json();
          setColorName(data.colorName);
          setColorPalette(data.palette);
        } catch (error) {
          console.error('Error analyzing color:', error);
          toast.error("Erreur lors de l'analyse de la couleur");
        }
      }
    };

    if (clothing?.color) {
      analyzeColor();
    }
  }, [clothing?.color]);

  const handleEdit = () => {
    console.log("Redirecting to edit page with clothing:", clothing);
    onClose();
    navigate('/add', { state: { mode: 'edit', clothing } });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!clothing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">{clothing.name}</DialogTitle>
            {isOwner && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg border bg-secondary/30">
              {clothing.image ? (
                <img
                  src={clothing.image}
                  alt={clothing.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary/30">
                  <span className="text-muted-foreground">Aucune image</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-primary mb-2">Informations générales</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Catégorie:</span> {clothing.category}</p>
                {clothing.subcategory && (
                  <p><span className="font-medium">Sous-catégorie:</span> {clothing.subcategory}</p>
                )}
                {clothing.brand && (
                  <p><span className="font-medium">Marque:</span> {clothing.brand}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-primary mb-2">Caractéristiques</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Couleur principale:</span>
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: clothing.color }}
                  />
                  <span>{colorName || clothing.color}</span>
                </div>
                {clothing.secondary_color && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Couleur secondaire:</span>
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: clothing.secondary_color }}
                    />
                    <span>{clothing.secondary_color}</span>
                  </div>
                )}
                {clothing.size && (
                  <p><span className="font-medium">Taille:</span> {clothing.size}</p>
                )}
                {clothing.material && (
                  <p><span className="font-medium">Matière:</span> {clothing.material}</p>
                )}
              </div>
            </div>

            {colorPalette.length > 0 && (
              <div>
                <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Palette de couleurs suggérée
                </h3>
                <div className="flex gap-2">
                  {colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: color }}
                      title={`Couleur complémentaire ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {clothing.is_for_sale && (
              <div>
                <h3 className="font-medium text-primary mb-2">Informations de vente</h3>
                <div className="space-y-2 text-sm">
                  {clothing.purchase_price && (
                    <p><span className="font-medium">Prix d'achat:</span> {clothing.purchase_price}€</p>
                  )}
                  {clothing.selling_price && (
                    <p><span className="font-medium">Prix de vente:</span> {clothing.selling_price}€</p>
                  )}
                  {clothing.location && (
                    <p><span className="font-medium">Localisation:</span> {clothing.location}</p>
                  )}
                </div>
              </div>
            )}

            {clothing.notes && (
              <div>
                <h3 className="font-medium text-primary mb-2">Notes</h3>
                <p className="text-sm">{clothing.notes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};