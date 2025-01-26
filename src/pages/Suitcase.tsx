import { Calendar } from "@/components/ui/calendar";
import { SuitcaseForm } from "@/components/suitcase/SuitcaseForm";
import { useState } from "react";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClothingSection } from "@/components/ClothingSection";

const Suitcase = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: outfits = [], isLoading: isLoadingOutfits } = useQuery({
    queryKey: ["userOutfits", selectedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("outfits")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching outfits:", error);
        return [];
      }

      return data || [];
    }
  });

  const { data: clothes = [], isLoading: isLoadingClothes } = useQuery({
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

  if (isLoadingOutfits || isLoadingClothes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Calendrier des tenues</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={fr}
            className="rounded-md border shadow"
          />
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Tenues prévues</h3>
            {outfits.map((outfit) => (
              <div key={outfit.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{outfit.name}</h4>
                <p className="text-muted-foreground">{outfit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Préparation de valise</h2>
          <SuitcaseForm />
        </div>
      </div>
    </div>
  );
};

export default Suitcase;