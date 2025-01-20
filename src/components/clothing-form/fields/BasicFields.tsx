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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface BasicFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const BasicFields = ({ form }: BasicFieldsProps) => {
  const [open, setOpen] = useState(false);
  const brands = ["Nike", "Adidas", "Puma", "Reebok", "Under Armour", "New Balance"];

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
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marque (optionnel)</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {field.value || "Sélectionner une marque"}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher une marque..." />
                  <CommandList>
                    <CommandEmpty>Aucune marque trouvée.</CommandEmpty>
                    <CommandGroup>
                      {brands.map((brand) => (
                        <CommandItem
                          key={brand}
                          value={brand}
                          onSelect={() => {
                            form.setValue("brand", brand);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === brand ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {brand}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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