import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isUploading: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  isLastStep?: boolean;
  onNext?: () => void;
}

export const SubmitButton = ({ 
  isUploading, 
  isSubmitting, 
  isValid,
  isLastStep = true,
  onNext
}: SubmitButtonProps) => {
  const isDisabled = isUploading || isSubmitting;
  
  let buttonText = isLastStep ? "Ajouter" : "Suivant";
  if (isUploading) buttonText = "Téléchargement...";
  if (isSubmitting) buttonText = "Ajout en cours...";

  return (
    <Button 
      type={isLastStep ? "submit" : "button"}
      className="w-full" 
      disabled={isDisabled}
      variant={isValid ? "default" : "secondary"}
      onClick={!isLastStep ? onNext : undefined}
    >
      {(isUploading || isSubmitting) && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {buttonText}
    </Button>
  );
};