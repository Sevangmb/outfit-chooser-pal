import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { Tag, FileText, Calendar as CalendarIcon, Tool, Archive } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
        name="purchase_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date d'achat
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_archived"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archiver
              </FormLabel>
              <div className="text-sm text-muted-foreground">
                Masquer temporairement ce vêtement de la garde-robe
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="needs_alterations"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="flex items-center gap-2">
                <Tool className="h-4 w-4" />
                À retoucher
              </FormLabel>
              <div className="text-sm text-muted-foreground">
                Ce vêtement nécessite des retouches
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {form.watch("needs_alterations") && (
        <FormField
          control={form.control}
          name="alteration_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes sur les retouches
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez les retouches à effectuer..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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