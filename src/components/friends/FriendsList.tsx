import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddFriendForm } from "./AddFriendForm";
import { FriendCard } from "./FriendCard";

interface Friend {
  id: number;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_email?: string;
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
        .select("*");

      if (error) {
        console.error("Error fetching friends:", error);
        throw error;
      }

      const friendsWithEmails = await Promise.all(
        friendships.map(async (friendship: Friend) => {
          const friendId = friendship.friend_id === session.user.id 
            ? friendship.user_id 
            : friendship.friend_id;

          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(friendId);
          
          if (userError) {
            console.error("Error fetching user:", userError);
            return {
              ...friendship,
              friend_email: "Unknown user"
            };
          }

          return {
            ...friendship,
            friend_email: user?.email
          };
        })
      );

      console.log("Fetched friends:", friendsWithEmails);
      return friendsWithEmails;
    },
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
      <AddFriendForm onFriendAdded={refetchFriends} />

      <div className="space-y-4">
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
    </div>
  );
};