import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuitcaseForm } from "@/components/suitcase/SuitcaseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Suitcase = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const { data: suitcases, isLoading, error: fetchError } = useQuery({
    queryKey: ["suitcases"],
    queryFn: async () => {
      console.log("Fetching suitcases...");
      const { data, error } = await supabase
        .from("suitcases")
        .select(`
          *,
          suitcase_clothes (
            clothes (
              id,
              name,
              image
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Unexpected error occurred while fetching suitcases:", error);
        toast.error("Une erreur inattendue est survenue lors du chargement des valises. Veuillez réessayer plus tard.");
        throw error;
      }

      console.log("Fetched suitcases:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error fetching suitcases:", error);
      toast.error("Erreur lors du chargement des valises");
    },
  });

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("suitcases").delete().eq("id", id);
      if (error) {
        console.error("Unexpected error occurred while deleting suitcase:", error);
        toast.error("Une erreur inattendue est survenue lors de la suppression de la valise. Veuillez réessayer plus tard.");
        return;
      }

      toast.success("Valise supprimée avec succès");
    } catch (error) {
      console.error("Error deleting suitcase:", error);
      toast.error("Erreur lors de la suppression de la valise");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes Valises</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {showForm ? "Fermer" : "Nouvelle Valise"}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Créer une nouvelle valise</CardTitle>
            </CardHeader>
            <CardContent>
              <SuitcaseForm onSuccess={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suitcases?.map((suitcase) => (
              <Card 
                key={suitcase.id} 
                className="w-full cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/suitcase/${suitcase.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{suitcase.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(suitcase.id);
                      }}
                    >
                      Supprimer
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suitcase.destination && (
                      <p className="text-sm text-gray-600">
                        Destination: {suitcase.destination}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Du {format(new Date(suitcase.start_date), "dd/MM/yyyy")} au{" "}
                      {format(new Date(suitcase.end_date), "dd/MM/yyyy")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {suitcase.suitcase_clothes?.length || 0} vêtements
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suitcase;