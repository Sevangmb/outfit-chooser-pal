import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trophy, Plus, Calendar as CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";
import { Database } from "@/integrations/supabase/types";

type Challenge = Database["public"]["Tables"]["challenges"]["Row"];

export const ChallengeManagement = () => {
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
    prize: "",
  });

  const { data: challenges = [], refetch } = useQuery({
    queryKey: ["admin-challenges"],
    queryFn: async () => {
      console.log("Fetching challenges...");
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Unexpected error occurred while fetching challenges:", error);
        toast.error("Une erreur inattendue est survenue lors du chargement des défis. Veuillez réessayer plus tard.");
        throw error;
      }

      return data;
    },
  });

  const createChallenge = async () => {
    try {
      console.log("Creating new challenge:", newChallenge);
      const { error } = await supabase.from("challenges").insert([
        {
          title: newChallenge.title,
          description: newChallenge.description,
          start_date: newChallenge.start_date.toISOString(),
          end_date: newChallenge.end_date.toISOString(),
          prize: newChallenge.prize,
          is_active: true,
        },
      ]);

      if (error) {
        console.error("Unexpected error occurred while creating challenge:", error);
        toast.error("Une erreur inattendue est survenue lors de la création du défi. Veuillez réessayer plus tard.");
        return;
      }

      toast.success("Challenge créé avec succès");
      refetch();
    } catch (error) {
      console.error("Unexpected error creating challenge:", error);
      toast.error("Erreur inattendue lors de la création du challenge");
    }
  };

  const toggleChallengeStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log("Toggling challenge status:", id, !currentStatus);
      const { error } = await supabase
        .from("challenges")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) {
        console.error("Unexpected error occurred while updating challenge status:", error);
        toast.error("Une erreur inattendue est survenue lors de la mise à jour du statut du défi. Veuillez réessayer plus tard.");
        return;
      }

      toast.success("Statut mis à jour avec succès");
      refetch();
    } catch (error) {
      console.error("Unexpected error updating challenge status:", error);
      toast.error("Erreur inattendue lors de la mise à jour du statut");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des défis</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau défi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau défi</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Titre du défi"
                value={newChallenge.title}
                onChange={(e) =>
                  setNewChallenge((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Textarea
                placeholder="Description"
                value={newChallenge.description}
                onChange={(e) =>
                  setNewChallenge((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de début</label>
                <Calendar
                  mode="single"
                  selected={newChallenge.start_date}
                  onSelect={(date) =>
                    setNewChallenge((prev) => ({
                      ...prev,
                      start_date: date || new Date(),
                    }))
                  }
                  locale={fr}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <Calendar
                  mode="single"
                  selected={newChallenge.end_date}
                  onSelect={(date) =>
                    setNewChallenge((prev) => ({
                      ...prev,
                      end_date: date || new Date(),
                    }))
                  }
                  locale={fr}
                />
              </div>
              <Input
                placeholder="Prix/Récompense"
                value={newChallenge.prize}
                onChange={(e) =>
                  setNewChallenge((prev) => ({ ...prev, prize: e.target.value }))
                }
              />
              <Button onClick={createChallenge}>Créer le défi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="p-4 border rounded-lg space-y-2 bg-card"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {challenge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
              </div>
              <Button
                variant={challenge.is_active ? "default" : "secondary"}
                onClick={() =>
                  toggleChallengeStatus(challenge.id, challenge.is_active || false)
                }
              >
                {challenge.is_active ? "Actif" : "Inactif"}
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {new Date(challenge.start_date).toLocaleDateString()} -{" "}
                {new Date(challenge.end_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                {challenge.prize}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};