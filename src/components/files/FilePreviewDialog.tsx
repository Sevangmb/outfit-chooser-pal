import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

interface FilePreviewDialogProps {
  previewImage: string | null;
  onOpenChange: (open: boolean) => void;
}

export const FilePreviewDialog = ({ previewImage, onOpenChange }: FilePreviewDialogProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Error loading image:", previewImage);
    setImageError(true);
    toast.error("Erreur lors du chargement de l'image");
  };

  return (
    <Dialog open={!!previewImage && !imageError} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Aperçu de l'image</DialogTitle>
          <DialogDescription>
            Cliquez en dehors de la fenêtre pour fermer
          </DialogDescription>
        </DialogHeader>
        {previewImage && (
          <img 
            src={previewImage} 
            alt="Aperçu" 
            className="w-full h-auto rounded-lg"
            onError={handleImageError}
            onLoad={() => setImageError(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};