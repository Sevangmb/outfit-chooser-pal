import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isUploading: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

export const SubmitButton = ({ isUploading, isSubmitting, isValid }: SubmitButtonProps) => {
  const isDisabled = isUploading || isSubmitting || !isValid;
  
  let buttonText = "Ajouter";
  if (isUploading) buttonText = "Téléchargement...";
  if (isSubmitting) buttonText = "Ajout en cours...";

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isDisabled}
      variant={isValid ? "default" : "secondary"}
    >
      {(isUploading || isSubmitting) && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {buttonText}
    </Button>
  );
};