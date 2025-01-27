import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";

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
  onCameraCapture,
  onFileUpload,
}: ImageUploadTabsProps) => {
  const handleFileSelect = async (file: File) => {
    const url = await onFileUpload(file);
    if (url) {
      form.setValue("image", url);
    }
  };

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </TabsTrigger>
        <TabsTrigger value="camera" className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Camera
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <ImageUpload
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          uploadError={uploadError}
          onCameraCapture={onCameraCapture}
          onFileSelect={handleFileSelect}
        />
      </TabsContent>
      <TabsContent value="camera">
        <div className="flex flex-col items-center gap-4">
          <video id="camera-preview" className="w-full aspect-video bg-black rounded-lg" />
          <div className="flex gap-4">
            <Button onClick={onCameraCapture}>Start Camera</Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};