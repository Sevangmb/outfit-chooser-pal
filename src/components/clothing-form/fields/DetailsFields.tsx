import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { Tag, FileText } from "lucide-react";

interface DetailsFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const DetailsFields = ({ form }: DetailsFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="size"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Taille (optionnel)
            </FormLabel>
            <FormControl>
              <Input placeholder="Ex: M, 42, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="material"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Matière (optionnel)
            </FormLabel>
            <FormControl>
              <Input placeholder="Ex: Coton, Laine, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes (optionnel)
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Ajoutez des notes ou commentaires sur ce vêtement..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};