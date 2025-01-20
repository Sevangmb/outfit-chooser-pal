import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isUploading: boolean;
}

export const SubmitButton = ({ isUploading }: SubmitButtonProps) => {
  return (
    <Button type="submit" className="w-full" disabled={isUploading}>
      {isUploading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Téléchargement...
        </>
      ) : (
        "Ajouter"
      )}
    </Button>
  );
};