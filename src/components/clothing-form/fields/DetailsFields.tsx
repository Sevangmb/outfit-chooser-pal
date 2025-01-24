import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Ruler, Tag } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const materials = [
  { value: "coton", label: "Coton" },
  { value: "laine", label: "Laine" },
  { value: "polyester", label: "Polyester" },
  { value: "nylon", label: "Nylon" },
  { value: "soie", label: "Soie" },
  { value: "lin", label: "Lin" },
  { value: "cuir", label: "Cuir" },
  { value: "denim", label: "Denim" },
];

interface DetailsFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const DetailsFields = ({ form }: DetailsFieldsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="size"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Taille
            </FormLabel>
            <FormControl>
              <Input placeholder="S, M, L, XL, 42, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="material"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Matière
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? materials.find((material) => material.value === field.value)?.label
                      : "Sélectionner une matière"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher une matière..." />
                  <CommandEmpty>Aucune matière trouvée.</CommandEmpty>
                  <CommandGroup>
                    {materials.map((material) => (
                      <CommandItem
                        key={material.value}
                        value={material.value}
                        onSelect={() => {
                          form.setValue("material", material.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === material.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {material.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ajoutez des notes sur ce vêtement..."
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