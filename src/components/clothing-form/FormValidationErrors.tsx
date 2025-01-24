import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormValidationErrorsProps {
  errors: Record<string, any>;
}

export const FormValidationErrors = ({ errors }: FormValidationErrorsProps) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc pl-4">
          {Object.entries(errors).map(([field, error]) => (
            <li key={field}>
              {error?.message?.toString() || "Champ invalide"}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};