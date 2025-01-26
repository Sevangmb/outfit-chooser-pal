import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserMinus, Search } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FriendsListProps {
  userId: string;
}

export const FriendsList = ({ userId }: FriendsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: friends = [], refetch: refetchFriends } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      console.log("Fetching friends for user:", userId);
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          friend:profiles!friendships_profiles_friend_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", userId)
        .eq("status", "accepted");

      if (error) {
        console.error("Error fetching friends:", error);
        toast.error("Erreur lors du chargement des amis");
        return [];
      }
      
      console.log("Friends data:", data);
      return (data?.map((f) => f.friend) || []) as Profile[];
    },
  });

  const { data: pendingFriends = [], refetch: refetchPending } = useQuery({
    queryKey: ["pending-friends", userId],
    queryFn: async () => {
      console.log("Fetching pending friends for user:", userId);
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          user:profiles!friendships_profiles_user_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("friend_id", userId)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending friends:", error);
        toast.error("Erreur lors du chargement des demandes d'amis");
        return [];
      }
      
      console.log("Pending friends data:", data);
      return (data?.map((f) => f.user) || []) as Profile[];
    },
  });

  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log("Searching users with query:", query);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .ilike("email", `%${query}%`)
        .limit(5);

      if (error) throw error;
      console.log("Search results:", data);
      setSearchResults(data as Profile[]);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Erreur lors de la recherche d'utilisateurs");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase.from("friendships").insert([
        {
          user_id: userId,
          friend_id: friendId,
          status: "pending",
        },
      ]);

      if (error) throw error;
      toast.success("Demande d'ami envoyée");
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Erreur lors de l'envoi de la demande d'ami");
    }
  };

  const acceptFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("user_id", friendId)
        .eq("friend_id", userId);

      if (error) throw error;
      toast.success("Demande d'ami acceptée");
      refetchFriends();
      refetchPending();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Erreur lors de l'acceptation de la demande d'ami");
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher un ami par email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>

      {searchResults.length > 0 && (
        <div className="border rounded-md p-4 space-y-2">
          <h3 className="font-medium mb-2">Résultats de la recherche</h3>
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{user.full_name?.[0] || user.email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.full_name || user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendFriendRequest(user.id)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">Mes Amis</TabsTrigger>
          <TabsTrigger value="pending">
            Demandes en attente
            {pendingFriends?.length ? ` (${pendingFriends.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {friends?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Vous n'avez pas encore d'amis
            </p>
          ) : (
            friends?.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>{friend.full_name?.[0] || friend.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.full_name || friend.email}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingFriends?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune demande d'ami en attente
            </p>
          ) : (
            pendingFriends?.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>{friend.full_name?.[0] || friend.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.full_name || friend.email}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => acceptFriendRequest(friend.id)}
                >
                  Accepter
                </Button>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};