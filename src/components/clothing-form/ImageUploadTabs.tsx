import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { toast } from "sonner";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImageUploadTabsProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  uploadProgress: number;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onUrlUpload: (url: string) => Promise<void>;
  onResetPreview: () => void;
}

export const ImageUploadTabs = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  uploadProgress,
  onFileUpload,
  onCameraCapture,
  onUrlUpload,
  onResetPreview,
}: ImageUploadTabsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error("Le fichier doit être une image (JPEG, PNG, WEBP ou GIF)");
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Le fichier est trop volumineux (max 5MB)");
        e.target.value = ''; // Reset input
        return;
      }

      console.log("Fichier sélectionné:", file.name, file.type, file.size);
      setSelectedFile(file);
      
      const imageUrl = await onFileUpload(file);
      console.log("URL de l'image reçue:", imageUrl);
      
      if (imageUrl) {
        console.log("Enregistrement de l'URL dans le formulaire:", imageUrl);
        form.setValue("image", imageUrl, { shouldValidate: true });
        toast.success("Image téléchargée avec succès");
      } else {
        throw new Error("URL de l'image non reçue");
      }
    } catch (error) {
      console.error("Erreur d'upload:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      setSelectedFile(null);
      form.setValue("image", null);
      e.target.value = ''; // Reset input
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl) {
      toast.error("Veuillez entrer une URL");
      return;
    }

    try {
      // Validate URL format
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i;
      if (!urlPattern.test(imageUrl)) {
        toast.error("L'URL doit pointer vers une image valide (JPG, PNG, WEBP ou GIF)");
        return;
      }

      // Test if the URL points to a valid image
      const response = await fetch(imageUrl);
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.startsWith('image/')) {
        toast.error("L'URL ne pointe pas vers une image valide");
        return;
      }

      console.log("Importation de l'image depuis l'URL:", imageUrl);
      form.setValue("image", imageUrl, { shouldValidate: true });
      await onUrlUpload(imageUrl);
      toast.success("Image importée avec succès");
    } catch (error) {
      console.error("Erreur d'import URL:", error);
      toast.error("Erreur lors de l'import de l'image");
      form.setValue("image", null);
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
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1"
              id="clothing-image"
              name="clothing-image"
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

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Upload en cours... {uploadProgress}%
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="URL de l'image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={isUploading || !imageUrl}
              variant="outline"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {previewUrl && (
          <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Erreur de chargement de l'image:", previewUrl);
                e.currentTarget.style.display = 'none';
                toast.error("Erreur lors du chargement de l'image");
              }}
            />
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};