import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Member } from "../types/member";

export const useGroupMembers = (groupId: number) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log("Fetching group members for group:", groupId);
      
      // First get the member records
      const { data: membersData, error: membersError } = await supabase
        .from("message_group_members")
        .select(`
          id,
          user_id,
          role,
          joined_at,
          is_approved
        `)
        .eq("group_id", groupId);

      if (membersError) {
        console.error("Error fetching members:", membersError);
        toast.error("Erreur lors du chargement des membres");
        return;
      }

      // Then fetch the corresponding profiles
      if (membersData) {
        const userIds = membersData.map(member => member.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          toast.error("Erreur lors du chargement des profils");
          return;
        }

        // Create a map of user_id to email for easy lookup
        const emailMap = new Map(
          profilesData?.map(profile => [profile.id, profile.email]) || []
        );

        // Transform the data combining member info with profile email
        const transformedMembers: Member[] = membersData.map(member => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          is_approved: member.is_approved,
          email: emailMap.get(member.user_id) || null
        }));

        console.log("Transformed members data:", transformedMembers);
        setMembers(transformedMembers);
      }
    } catch (error) {
      console.error("Error in fetchMembers:", error);
      toast.error("Erreur lors du chargement des membres");
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: number, newRole: string) => {
    try {
      console.log("Updating member role:", memberId, newRole);
      const { error } = await supabase
        .from("message_group_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Rôle mis à jour avec succès");
      fetchMembers();
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const removeMember = async (memberId: number) => {
    try {
      console.log("Removing member:", memberId);
      const { error } = await supabase
        .from("message_group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Membre retiré avec succès");
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Erreur lors de la suppression du membre");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  return {
    members,
    loading,
    updateMemberRole,
    removeMember
  };
};