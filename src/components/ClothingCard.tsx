import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, Shirt, Trash2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClothingDetailsDialog } from "@/components/ClothingDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClothingCardProps {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string | null;
}

export const ClothingCard = ({ id, name, category, color, image }: ClothingCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    try {
      // If there's an image, delete it from storage first
      if (image) {
        // Extract the filename from the path or URL
        const fileName = image.split('/').pop();
        if (fileName) {
          console.log("Deleting image from storage:", fileName);
          const { error: storageError } = await supabase.storage
            .from('clothes')
            .remove([fileName]);

          if (storageError) {
            console.error("Error deleting image from storage:", storageError);
            toast.error("Erreur lors de la suppression de l'image");
            return;
          }
        }
      }

      // Delete the clothing record from the database
      const { error: dbError } = await supabase
        .from('clothes')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error("Error deleting clothing record:", dbError);
        toast.error("Erreur lors de la suppression du vêtement");
        return;
      }

      toast.success("Vêtement supprimé avec succès");
      
      // Refresh the page or update the UI as needed
      window.location.reload();
    } catch (error) {
      console.error("Error in deletion process:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    }
  };

  useEffect(() => {
    if (!image) {
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        // Check if the image is already a full URL
        if (image.startsWith('http')) {
          console.log("Loading image from URL:", image);
          setImageUrl(image);
          setIsLoading(false);
          return;
        }

        // Get the public URL for the image directly
        const { data: { publicUrl } } = supabase.storage
          .from('clothes')
          .getPublicUrl(image);

        console.log("Generated public URL:", publicUrl);
        setImageUrl(publicUrl);
      } catch (error) {
        console.error("Error loading image:", error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [image]);

  return (
    <>
      <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="p-0">
          <AspectRatio ratio={1}>
            {isLoading ? (
              <div className="flex h-full items-center justify-center bg-muted">
                <Shirt className="h-8 w-8 animate-pulse text-muted-foreground" />
              </div>
            ) : imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={name}
                className="object-cover transition-all group-hover:scale-105"
                onError={(e) => {
                  console.error("Error loading image:", imageUrl);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Shirt className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold">{name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span>{category}</span>
                <span>{color}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setIsDetailsOpen(true)}
                >
                  <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le vêtement et son image seront définitivement supprimés.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
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
