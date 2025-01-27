import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ContentModeration = () => {
  const [loading, setLoading] = useState(false);

  const { data: flaggedOutfits } = useQuery({
    queryKey: ["flaggedOutfits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outfits")
        .select(`
          *,
          profiles!outfits_profiles_user_id_fkey (
            username,
            email
          )
        `)
        .eq("is_flagged", true);

      if (error) throw error;
      return data;
    },
  });

  const { data: flaggedComments } = useQuery({
    queryKey: ["flaggedComments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outfit_comments")
        .select(`
          *,
          profiles!outfit_comments_user_id_fkey (
            username,
            email
          )
        `)
        .eq("is_flagged", true);

      if (error) throw error;
      return data;
    },
  });

  const handleModerateOutfit = async (outfitId: number, action: "approve" | "reject") => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("moderate_outfit", {
        p_outfit_id: outfitId,
        p_action: action,
      });

      if (error) throw error;
      toast.success(`Outfit ${action}ed successfully`);
    } catch (error) {
      console.error("Error moderating outfit:", error);
      toast.error("Failed to moderate outfit");
    } finally {
      setLoading(false);
    }
  };

  const handleModerateComment = async (commentId: number, action: "approve" | "reject") => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("moderate_comment", {
        p_comment_id: commentId,
        p_action: action,
      });

      if (error) throw error;
      toast.success(`Comment ${action}ed successfully`);
    } catch (error) {
      console.error("Error moderating comment:", error);
      toast.error("Failed to moderate comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Flagged Outfits</h3>
        <div className="space-y-4">
          {flaggedOutfits?.map((outfit) => (
            <div key={outfit.id} className="border p-4 rounded-lg">
              <p>Posted by: {outfit.profiles?.username || "Unknown user"}</p>
              <p>Reason: {outfit.flag_reason}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => handleModerateOutfit(outfit.id, "approve")}
                  disabled={loading}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleModerateOutfit(outfit.id, "reject")}
                  disabled={loading}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Flagged Comments</h3>
        <div className="space-y-4">
          {flaggedComments?.map((comment) => (
            <div key={comment.id} className="border p-4 rounded-lg">
              <p>Posted by: {comment.profiles?.username || "Unknown user"}</p>
              <p>Content: {comment.content}</p>
              <p>Reason: {comment.flag_reason}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => handleModerateComment(comment.id, "approve")}
                  disabled={loading}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleModerateComment(comment.id, "reject")}
                  disabled={loading}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};