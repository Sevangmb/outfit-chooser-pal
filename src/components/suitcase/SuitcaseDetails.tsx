import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { ClothingCard } from "@/components/ClothingCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export const SuitcaseDetails = () => {
  const { id } = useParams();
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [suitcaseClothes, setSuitcaseClothes] = useState<any[]>([]);

  const { data: suitcase, isLoading: isSuitcaseLoading } = useQuery({
    queryKey: ["suitcase", id],
    queryFn: async () => {
      console.log("Fetching suitcase details:", id);
      const { data, error } = await supabase
        .from("suitcases")
        .select(`
          *,
          suitcase_clothes (
            clothes (*)
          )
        `)
        .eq("id", Number(id)) // Convert string id to number
        .single();

      if (error) {
        console.error("Error fetching suitcase:", error);
        toast.error("Erreur lors du chargement de la valise");
        throw error;
      }

      console.log("Fetched suitcase:", data);
      return data;
    },
  });

  const { data: wardrobe, isLoading: isWardrobeLoading } = useQuery({
    queryKey: ["wardrobe"],
    queryFn: async () => {
      console.log("Fetching wardrobe");
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching wardrobe:", error);
        toast.error("Erreur lors du chargement de la garde-robe");
        throw error;
      }

      console.log("Fetched wardrobe:", data);
      return data;
    },
  });

  useEffect(() => {
    if (suitcase?.suitcase_clothes) {
      setSuitcaseClothes(suitcase.suitcase_clothes.map((sc: any) => sc.clothes));
    }
  }, [suitcase]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const clothingId = Number(active.id);
    const targetId = over.id.toString();

    if (targetId === "suitcase" && !suitcaseClothes.find(c => c.id === clothingId)) {
      try {
        const { error } = await supabase
          .from("suitcase_clothes")
          .insert({
            suitcase_id: Number(id),
            clothes_id: clothingId,
          });

        if (error) throw error;

        // Update local state
        const clothingItem = wardrobe?.find(c => c.id === clothingId);
        if (clothingItem) {
          setSuitcaseClothes(prev => [...prev, clothingItem]);
        }
        
        toast.success("Vêtement ajouté à la valise");
      } catch (error) {
        console.error("Error adding clothing to suitcase:", error);
        toast.error("Erreur lors de l'ajout du vêtement");
      }
    } else if (targetId === "wardrobe" && suitcaseClothes.find(c => c.id === clothingId)) {
      try {
        const { error } = await supabase
          .from("suitcase_clothes")
          .delete()
          .eq("suitcase_id", Number(id))
          .eq("clothes_id", clothingId);

        if (error) throw error;

        // Update local state
        setSuitcaseClothes(prev => prev.filter(c => c.id !== clothingId));
        
        toast.success("Vêtement retiré de la valise");
      } catch (error) {
        console.error("Error removing clothing from suitcase:", error);
        toast.error("Erreur lors du retrait du vêtement");
      }
    }

    setActiveDragId(null);
  };

  if (isSuitcaseLoading || isWardrobeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const wardrobeClothes = wardrobe?.filter(
    clothing => !suitcaseClothes.find(sc => sc.id === clothing.id)
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Suitcase Section */}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div 
            id="suitcase"
            className="border-2 border-dashed border-gray-300 rounded-lg p-4"
          >
            <h2 className="text-2xl font-bold mb-4">Ma Valise: {suitcase?.name}</h2>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {suitcaseClothes.map((clothing) => (
                  <ClothingCard
                    key={clothing.id}
                    {...clothing}
                    isDraggable
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Wardrobe Section */}
          <div 
            id="wardrobe"
            className="border-2 border-dashed border-gray-300 rounded-lg p-4"
          >
            <h2 className="text-2xl font-bold mb-4">Ma Garde-Robe</h2>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {wardrobeClothes.map((clothing) => (
                  <ClothingCard
                    key={clothing.id}
                    {...clothing}
                    isDraggable
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <DragOverlay>
            {activeDragId ? (
              <div className="opacity-50">
                <ClothingCard
                  {...(wardrobeClothes.find(c => c.id === activeDragId) || 
                      suitcaseClothes.find(c => c.id === activeDragId))}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};