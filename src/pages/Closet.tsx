import { Navigation } from "@/components/Navigation";
import { ClothingTab } from "@/components/ClothingTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Closet = () => {
  const { data: clothes = [], isLoading } = useQuery({
    queryKey: ["clothes"],
    queryFn: async () => {
      const { data: clothes, error } = await supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching clothes:", error);
        throw error;
      }

      return clothes;
    },
  });

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <div className="container py-8 px-4 mx-auto mt-16">
        <h1 className="text-2xl font-bold mb-4">Placard</h1>
        <ClothingTab clothes={clothes} />
      </div>
    </div>
  );
};

export default Closet;