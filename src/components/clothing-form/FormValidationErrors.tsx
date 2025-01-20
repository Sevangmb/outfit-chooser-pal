import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormValidationErrorsProps {
  errors: Record<string, any>;
}

export const FormValidationErrors = ({ errors }: FormValidationErrorsProps) => {
  const getRequiredFieldsErrors = () => {
    const requiredFields = {
      name: "le nom",
      category: "la catégorie",
      color: "la couleur",
      image: "l'image"
    };
    
    return Object.entries(errors)
      .filter(([key]) => key in requiredFields)
      .map(([key]) => requiredFields[key as keyof typeof requiredFields]);
  };

  const missingFields = getRequiredFieldsErrors();

  if (missingFields.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Champs requis manquants : {missingFields.join(", ")}
      </AlertDescription>
    </Alert>
  );
};