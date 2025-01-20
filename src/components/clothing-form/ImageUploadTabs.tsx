import { Camera, Link, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";

interface ImageUploadTabsProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onUrlUpload: (url: string) => Promise<void>;
}

export const ImageUploadTabs = ({
  form,
  isUploading,
  previewUrl,
  onFileUpload,
  onCameraCapture,
  onUrlUpload,
}: ImageUploadTabsProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyImageUrl = async (url: string) => {
    try {
      setIsVerifying(true);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Image not accessible: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("URL does not point to a valid image");
      }
      return true;
    } catch (error) {
      console.error("Error verifying image URL:", error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleImageLoad = useCallback(() => {
    setImageLoadError(false);
    toast.success("Image chargée avec succès");
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoadError(true);
    toast.error("Erreur lors du chargement de l'image");
  }, []);

  useEffect(() => {
    if (previewUrl) {
      verifyImageUrl(previewUrl).then(isValid => {
        if (!isValid) {
          setImageLoadError(true);
          toast.error("L'image n'a pas pu être chargée correctement");
        } else {
          setImageLoadError(false);
        }
      });
    } else {
      setImageLoadError(false);
    }
  }, [previewUrl]);

  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="camera">
            <Camera className="h-4 w-4 mr-2" />
            Photo
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link className="h-4 w-4 mr-2" />
            URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const imageUrl = await onFileUpload(file);
                  if (imageUrl) {
                    form.setValue("image", imageUrl);
                  }
                }
              }}
              disabled={isUploading}
            />
          </FormControl>
        </TabsContent>

        <TabsContent value="camera">
          <Button
            type="button"
            onClick={onCameraCapture}
            className="w-full"
            disabled={isUploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Prendre une photo
          </Button>
        </TabsContent>

        <TabsContent value="url">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              onChange={(e) => form.setValue("imageUrl", e.target.value)}
              disabled={isUploading || isVerifying}
            />
            <Button
              type="button"
              onClick={async () => {
                const url = form.getValues("imageUrl");
                if (url) {
                  const isValid = await verifyImageUrl(url);
                  if (isValid) {
                    onUrlUpload(url);
                  } else {
                    toast.error("L'URL ne pointe pas vers une image valide");
                  }
                }
              }}
              disabled={isUploading || isVerifying}
            >
              {isVerifying ? "Vérification..." : "Importer"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {previewUrl && (
        <div className="mt-4 relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
          <img
            src={previewUrl}
            alt="Aperçu"
            className={`object-cover w-full h-full ${imageLoadError ? 'opacity-50' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {imageLoadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <p className="text-destructive">Erreur de chargement de l'image</p>
            </div>
          )}
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
};