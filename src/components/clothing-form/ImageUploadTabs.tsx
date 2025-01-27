import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useCameraCapture } from "./hooks/useCameraCapture";

interface ImageUploadTabsProps {
  onImageSelect: (file: File) => void;
  onImageCapture: (imageBlob: Blob) => void;
}

export const ImageUploadTabs = ({ onImageSelect, onImageCapture }: ImageUploadTabsProps) => {
  const { startCapture, stopCapture } = useCameraCapture();

  const handleCameraStart = () => {
    startCapture(onImageCapture);
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
        <ImageUpload onImageSelect={onImageSelect} />
      </TabsContent>
      <TabsContent value="camera">
        <div className="flex flex-col items-center gap-4">
          <video id="camera-preview" className="w-full aspect-video bg-black rounded-lg" />
          <div className="flex gap-4">
            <Button onClick={handleCameraStart}>Start Camera</Button>
            <Button variant="outline" onClick={stopCapture}>Stop Camera</Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};