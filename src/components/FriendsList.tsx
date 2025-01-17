import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, UserCheck, UserX } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Friend {
  id: number;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_email?: string;
}

export const FriendsList = () => {
  const [newFriendEmail, setNewFriendEmail] = useState("");

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

      // For each friendship, get the friend's email using their profile
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

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      // Find the user by email
      const { data, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) {
        console.error("Error fetching users:", userError);
        toast.error("Erreur lors de la recherche de l'utilisateur");
        return;
      }

      // Ensure data.users exists and is an array before using find
      if (!Array.isArray(data?.users)) {
        toast.error("Erreur lors de la recherche de l'utilisateur");
        return;
      }

      const friendUser = data.users.find((u: User) => u.email === newFriendEmail);
      if (!friendUser) {
        toast.error("Utilisateur non trouvé");
        return;
      }

      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(user_id.eq.${session.user.id},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${session.user.id})`)
        .single();

      if (existingFriendship) {
        toast.error("Cette amitié existe déjà");
        return;
      }

      // Create new friendship
      const { error } = await supabase
        .from("friendships")
        .insert([{ 
          user_id: session.user.id,
          friend_id: friendUser.id,
          status: 'pending'
        }]);

      if (error) {
        console.error("Error adding friend:", error);
        toast.error("Erreur lors de l'ajout de l'ami");
        return;
      }

      toast.success("Demande d'ami envoyée");
      setNewFriendEmail("");
      refetchFriends();
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Erreur lors de l'ajout de l'ami");
    }
  };

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
      <form onSubmit={handleAddFriend} className="flex gap-2">
        <Input
          type="email"
          placeholder="Email de l'ami"
          value={newFriendEmail}
          onChange={(e) => setNewFriendEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </form>

      <div className="space-y-4">
        {friends.map((friend: Friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50"
          >
            <span>{friend.friend_email}</span>
            <div className="flex gap-2">
              {friend.status === "pending" && (
                <Button
                  onClick={() => handleAcceptFriend(friend.id)}
                  variant="outline"
                  size="sm"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Accepter
                </Button>
              )}
              <Button
                onClick={() => handleRemoveFriend(friend.id)}
                variant="destructive"
                size="sm"
              >
                <UserX className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};