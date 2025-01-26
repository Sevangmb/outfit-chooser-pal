import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClothingTabProps {
  showFriendsClothes: boolean;
}

export const ClothingTab = ({ showFriendsClothes }: ClothingTabProps) => {
  const { data: clothes, isLoading, error } = useQuery({
    queryKey: ["clothes"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading clothes</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {clothes?.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow p-4">
          {item.image && (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-48 object-cover rounded-md mb-2"
            />
          )}
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600">{item.category}</p>
        </div>
      ))}
    </div>
  );
};