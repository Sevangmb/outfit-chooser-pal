import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface BasicFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const BasicFields = ({ form }: BasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input placeholder="Ex: T-shirt blanc" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL de l'image</FormLabel>
            <FormControl>
              <Input readOnly value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};