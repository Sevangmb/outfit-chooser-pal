import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddFriendForm } from "@/components/friends/AddFriendForm";
import { FriendCard } from "@/components/friends/FriendCard";
import { ClothingTab } from "./ClothingTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Friend {
  id: number;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_email?: string;
}

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
  user_id: string;
}

export const FriendsList = () => {
  const { data: friends = [], refetch: refetchFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      console.log("Fetching friends...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data: friendships, error } = await supabase
        .from("friendships")
        .select(`
          *,
          friend:profiles!friendships_friend_id_fkey(email)
        `);

      if (error) {
        console.error("Error fetching friends:", error);
        throw error;
      }

      const friendsWithEmails = friendships.map((friendship: any) => ({
        ...friendship,
        friend_email: friendship.friend?.email
      }));

      console.log("Fetched friends:", friendsWithEmails);
      return friendsWithEmails;
    },
  });

  const { data: friendsClothes = [] } = useQuery({
    queryKey: ["friendsClothes"],
    queryFn: async () => {
      const acceptedFriends = friends.filter(f => f.status === 'accepted');
      if (acceptedFriends.length === 0) return [];

      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .in('user_id', acceptedFriends.map(f => f.friend_id));

      if (error) {
        console.error("Error fetching friends' clothes:", error);
        throw error;
      }

      return data as Clothing[];
    },
    enabled: friends.length > 0,
  });

  const handleAcceptFriend = async (friendshipId: number) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);

      if (error) {
        toast.error("Erreur lors de l'acceptation de la demande");
        return;
      }

      toast.success("Demande d'ami acceptée");
      refetchFriends();
    } catch (error) {
      console.error("Error accepting friend:", error);
      toast.error("Erreur lors de l'acceptation de la demande");
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) {
        toast.error("Erreur lors de la suppression de l'ami");
        return;
      }

      toast.success("Ami supprimé");
      refetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Erreur lors de la suppression de l'ami");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="friends">Mes Amis</TabsTrigger>
          <TabsTrigger value="clothes">Leurs Vêtements</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <AddFriendForm onFriendAdded={refetchFriends} />
          <div className="space-y-4 mt-6">
            {friends.map((friend: Friend) => (
              <FriendCard
                key={friend.id}
                friendEmail={friend.friend_email || "Unknown user"}
                status={friend.status}
                onAccept={() => handleAcceptFriend(friend.id)}
                onRemove={() => handleRemoveFriend(friend.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clothes">
          <ClothingTab clothes={friendsClothes} showFriendsClothes />
        </TabsContent>
      </Tabs>
    </div>
  );
};