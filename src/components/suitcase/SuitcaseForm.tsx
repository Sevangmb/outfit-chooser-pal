import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { ClothingSection } from "../ClothingSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SuitcaseForm = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedClothes, setSelectedClothes] = useState<number[]>([]);

  const { data: clothes = [], isLoading } = useQuery({
    queryKey: ["userClothes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching clothes:", error);
        return [];
      }

      return data || [];
    }
  });

  const tops = clothes.filter(item => 
    item.category.toLowerCase().includes("haut") || 
    item.category.toLowerCase().includes("t-shirt") ||
    item.category.toLowerCase().includes("chemise") ||
    item.category.toLowerCase().includes("pull")
  );

  const bottoms = clothes.filter(item => 
    item.category.toLowerCase().includes("bas") || 
    item.category.toLowerCase().includes("pantalon") ||
    item.category.toLowerCase().includes("jean") ||
    item.category.toLowerCase().includes("short")
  );

  const shoes = clothes.filter(item => 
    item.category.toLowerCase().includes("chaussure") || 
    item.category.toLowerCase().includes("basket") ||
    item.category.toLowerCase().includes("botte")
  );

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date de départ</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date de retour</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-6">
        <ClothingSection title="Hauts" items={tops} isMobile={false} />
        <ClothingSection title="Bas" items={bottoms} isMobile={false} />
        <ClothingSection title="Chaussures" items={shoes} isMobile={false} />
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Annuler</Button>
        <Button>Sauvegarder la valise</Button>
      </div>
    </div>
  );
};