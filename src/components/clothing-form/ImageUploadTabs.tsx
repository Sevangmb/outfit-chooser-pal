import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ImageUploadTabsProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onUrlUpload: (url: string) => Promise<void>;
}

export const ImageUploadTabs = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  onFileUpload,
  onCameraCapture,
}: ImageUploadTabsProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageLoad = useCallback(() => {
    console.log("Image chargée avec succès");
    setImageLoadError(false);
  }, []);

  const handleImageError = useCallback(() => {
    console.log("Erreur lors du chargement de l'image");
    setImageLoadError(true);
    toast.error("Erreur lors du chargement de l'image");
    // Réinitialiser le champ image du formulaire
    form.setValue("image", null);
  }, [form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error("L'image est trop volumineuse (max 5MB)");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Le fichier doit être une image");
        return;
      }

      console.log("Fichier sélectionné:", file.name);
      setSelectedFile(file);
      try {
        const imageUrl = await onFileUpload(file);
        if (imageUrl) {
          console.log("URL de l'image enregistrée:", imageUrl);
          form.setValue("image", imageUrl, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Erreur lors du téléchargement:", error);
        toast.error("Erreur lors du téléchargement de l'image");
        setSelectedFile(null);
      }
    }
  };

  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <div className="space-y-4">
        <div className="flex gap-2">
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1"
            />
          </FormControl>
          <Button
            type="button"
            onClick={onCameraCapture}
            disabled={isUploading}
            variant="outline"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            Fichier sélectionné: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {previewUrl && (
          <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Aperçu"
              className={`object-cover w-full h-full ${imageLoadError ? 'opacity-50' : ''}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {imageLoadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <p className="text-destructive">Erreur lors du chargement de l'image</p>
              </div>
            )}
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};