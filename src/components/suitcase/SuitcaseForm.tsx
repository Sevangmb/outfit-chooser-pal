import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { ClothingCarousel } from "../outfit/ClothingCarousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const SuitcaseForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedClothes, setSelectedClothes] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !name) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert the suitcase
      const { data: suitcase, error: suitcaseError } = await supabase
        .from("suitcases")
        .insert({
          name,
          description,
          destination,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
        .select()
        .single();

      if (suitcaseError) throw suitcaseError;

      // Insert the clothes selections
      if (selectedClothes.length > 0) {
        const { error: clothesError } = await supabase
          .from("suitcase_clothes")
          .insert(
            selectedClothes.map(clothesId => ({
              suitcase_id: suitcase.id,
              clothes_id: clothesId
            }))
          );

        if (clothesError) throw clothesError;
      }

      toast.success("Valise créée avec succès");
      // Reset form
      setName("");
      setDescription("");
      setDestination("");
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedClothes([]);
    } catch (error) {
      console.error("Error creating suitcase:", error);
      toast.error("Erreur lors de la création de la valise");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const toggleClothingSelection = (id: number) => {
    setSelectedClothes(prev => 
      prev.includes(id) 
        ? prev.filter(clothingId => clothingId !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nom de la valise</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vacances d'été..."
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de votre voyage..."
          />
        </div>

        <div>
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Paris, France..."
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <Label>Date de départ</Label>
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
            <Label>Date de retour</Label>
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
      </div>

      <div className="space-y-6">
        <ClothingCarousel 
          title="Hauts" 
          items={tops} 
          selectedId={null} 
          onSelect={toggleClothingSelection} 
        />
        <ClothingCarousel 
          title="Bas" 
          items={bottoms} 
          selectedId={null} 
          onSelect={toggleClothingSelection} 
        />
        <ClothingCarousel 
          title="Chaussures" 
          items={shoes} 
          selectedId={null} 
          onSelect={toggleClothingSelection} 
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Création..." : "Créer la valise"}
        </Button>
      </div>
    </form>
  );
};