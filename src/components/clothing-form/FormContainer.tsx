import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { FormValidationErrors } from "./FormValidationErrors";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface FormContainerProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, any>;
  children: React.ReactNode;
}

export const FormContainer = ({
  form,
  onSubmit,
  isValid,
  isSubmitting,
  errors,
  children
}: FormContainerProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormValidationErrors errors={errors} />
        {children}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isSubmitting ? "Ajout en cours..." : "Ajouter"}
        </Button>
      </form>
    </Form>
  );
};