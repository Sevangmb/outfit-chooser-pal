import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SuitcaseFormProps {
  onSuccess?: () => void;
}

export const SuitcaseForm = ({ onSuccess }: SuitcaseFormProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedClothes, setSelectedClothes] = useState<number[]>([]);

  const { data: clothes } = useQuery({
    queryKey: ["clothes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner les dates de voyage");
      return;
    }

    setIsLoading(true);
    try {
      // Insert suitcase
      const { data: suitcase, error: suitcaseError } = await supabase
        .from("suitcases")
        .insert({
          name,
          description,
          destination,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .select()
        .single();

      if (suitcaseError) throw suitcaseError;

      // Insert selected clothes
      if (selectedClothes.length > 0) {
        const { error: clothesError } = await supabase
          .from("suitcase_clothes")
          .insert(
            selectedClothes.map((clothesId) => ({
              suitcase_id: suitcase.id,
              clothes_id: clothesId,
            }))
          );

        if (clothesError) throw clothesError;
      }

      toast.success("Valise créée avec succès");
      queryClient.invalidateQueries({ queryKey: ["suitcases"] });
      
      // Reset form
      setName("");
      setDescription("");
      setDestination("");
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedClothes([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating suitcase:", error);
      toast.error("Erreur lors de la création de la valise");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de la valise</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de départ</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Sélectionner"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date de retour</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Sélectionner"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
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

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Création..." : "Créer la valise"}
      </Button>
    </form>
  );
};