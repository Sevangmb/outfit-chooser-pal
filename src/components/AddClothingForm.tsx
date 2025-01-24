import { useImageUpload } from "@/hooks/useImageUpload";
import { useClothingForm } from "./clothing-form/hooks/useClothingForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FormContainer } from "./clothing-form/FormContainer";
import { ImageSection } from "./clothing-form/ImageSection";
import { FieldsSection } from "./clothing-form/FieldsSection";
import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const navigate = useNavigate();
  
  const { form, onSubmit, isValid, isSubmitting, errors } = useClothingForm(async (values) => {
    console.log("Form submitted successfully with values:", values);
    toast.success(`Le vêtement "${values.name}" a été ajouté à votre garde-robe`);
    navigate("/closet");
    onSuccess?.();
  });
  
  const { isUploading, previewUrl, uploadError, handleImageUpload, resetPreview } = useImageUpload();

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = "Découvrez mon nouveau vêtement sur Lovable!";
    
    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: "Lovable",
            text: shareText,
            url: shareUrl,
          }).catch(console.error);
          return;
        }
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error("Impossible de créer le contexte canvas");
      }
      
      context.drawImage(video, 0, 0);
      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
      );
      
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      const imageUrl = await handleImageUpload(file);
      
      if (imageUrl) {
        form.setValue("image", imageUrl, { shouldValidate: true });
        toast.success("Image capturée avec succès");
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Erreur lors de la capture de l'image");
    }
  };

  return (
    <FormContainer
      form={form}
      onSubmit={onSubmit}
      isValid={isValid}
      isSubmitting={isSubmitting}
      errors={errors}
    >
      <div className="space-y-8">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleShare('twitter')}>
                Partager sur Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('facebook')}>
                Partager sur Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                Partager sur LinkedIn
              </DropdownMenuItem>
              {navigator.share && (
                <DropdownMenuItem onClick={() => handleShare('native')}>
                  Partager...
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ImageSection
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          uploadError={uploadError}
          onFileUpload={handleImageUpload}
          onCameraCapture={handleCameraCapture}
        />
        <FieldsSection form={form} />
      </div>
    </FormContainer>
  );
};