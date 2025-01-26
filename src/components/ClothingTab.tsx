import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClothingItem } from "@/components/ClothingItem";

interface ClothingTabProps {
  showFriendsClothes: boolean;
}

export const ClothingTab = ({ showFriendsClothes }: ClothingTabProps) => {
  const { data: clothes, isLoading, error } = useQuery({
    queryKey: ["clothes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("user_id", supabase.auth.user()?.id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading clothes</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {clothes?.map((item) => (
        <ClothingItem key={item.id} item={item} showFriendsClothes={showFriendsClothes} />
      ))}
    </div>
  );
};
