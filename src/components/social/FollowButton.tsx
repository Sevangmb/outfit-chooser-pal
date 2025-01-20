import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange: () => void;
}

export const FollowButton = ({ userId, isFollowing, onFollowChange }: FollowButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour suivre un utilisateur");
        return;
      }

      if (isFollowing) {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("following_id", userId);

        if (error) throw error;
        toast.success("Vous ne suivez plus cet utilisateur");
      } else {
        const { error } = await supabase
          .from("followers")
          .insert([
            {
              follower_id: session.user.id,
              following_id: userId
            }
          ]);

        if (error) throw error;
        toast.success("Vous suivez maintenant cet utilisateur");
      }

      onFollowChange();
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "destructive" : "default"}
      onClick={handleFollow}
      disabled={loading}
      size="sm"
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Ne plus suivre
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Suivre
        </>
      )}
    </Button>
  );
};