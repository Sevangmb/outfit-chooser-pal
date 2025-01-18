import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { User } from "@supabase/supabase-js";

export const AddFriendForm = ({ onFriendAdded }: { onFriendAdded: () => void }) => {
  const [newFriendEmail, setNewFriendEmail] = useState("");

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { data, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) {
        console.error("Error fetching users:", userError);
        toast.error("Erreur lors de la recherche de l'utilisateur");
        return;
      }

      if (!Array.isArray(data?.users)) {
        toast.error("Erreur lors de la recherche de l'utilisateur");
        return;
      }

      const friendUser = data.users.find((u: User) => u.email === newFriendEmail);
      if (!friendUser) {
        toast.error("Utilisateur non trouvé");
        return;
      }

      const { data: existingFriendship } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(user_id.eq.${session.user.id},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${session.user.id})`)
        .single();

      if (existingFriendship) {
        toast.error("Cette amitié existe déjà");
        return;
      }

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
      onFriendAdded();
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Erreur lors de l'ajout de l'ami");
    }
  };

  return (
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
  );
};