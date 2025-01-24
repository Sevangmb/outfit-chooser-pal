import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface FilePreviewDialogProps {
  previewImage: string | null;
  onOpenChange: (open: boolean) => void;
}

export const FilePreviewDialog = ({ previewImage, onOpenChange }: FilePreviewDialogProps) => {
  return (
    <Dialog open={!!previewImage} onOpenChange={onOpenChange}>
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
            onError={(e) => {
              console.error("Error loading image:", previewImage);
              toast.error("Erreur lors du chargement de l'image");
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};