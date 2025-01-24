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
import { verifyImageUrl } from "@/utils/imageValidation";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!file.type.startsWith('image/')) {
        toast.error("Le fichier doit être une image");
        return;
      }

      console.log("File selected:", file.name);
      setSelectedFile(file);
      
      const imageUrl = await onFileUpload(file);
      console.log("Image URL received:", imageUrl);
      
      if (imageUrl) {
        console.log("Setting image URL in form:", imageUrl);
        form.setValue("image", imageUrl, { shouldValidate: true });
        toast.success("Image téléchargée avec succès");
      } else {
        throw new Error("URL de l'image non reçue");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      setSelectedFile(null);
      form.setValue("image", null);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Veuillez entrer une URL");
      return;
    }

    try {
      const isValid = await verifyImageUrl(imageUrl);
      if (!isValid) {
        toast.error("L'URL ne pointe pas vers une image valide");
        return;
      }

      form.setValue("image", imageUrl, { shouldValidate: true });
      toast.success("Image importée avec succès");
    } catch (error) {
      console.error("URL import error:", error);
      toast.error("Erreur lors de l'import de l'image");
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
          <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};