import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { Tag } from "lucide-react";

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
            <FormLabel className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Nom
            </FormLabel>
            <FormControl>
              <Input placeholder="Ex: T-shirt blanc préféré" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Marque (optionnel)
            </FormLabel>
            <FormControl>
              <Input placeholder="Ex: Nike, Zara, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};