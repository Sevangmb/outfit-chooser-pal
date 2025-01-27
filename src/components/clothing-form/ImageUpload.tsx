import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FileUploader } from "../shared/FileUploader";

interface ImageUploadProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  onCameraCapture: () => Promise<void>;
  onFileSelect: (file: File) => void;
}

export const ImageUpload = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  onCameraCapture,
  onFileSelect,
}: ImageUploadProps) => {
  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <div className="space-y-4">
        <div className="flex gap-2">
          <FormControl>
            <FileUploader
              accept="image/*"
              onUploadSuccess={onFileSelect}
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