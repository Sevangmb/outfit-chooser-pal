import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Member } from '../types/member';
import { toast } from 'sonner';

export const useGroupMembers = (groupId: number) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    try {
      console.log('Fetching members for group:', groupId);
      const { data: membersData, error: membersError } = await supabase
        .from('message_group_members')
        .select(`
          id,
          user_id,
          joined_at,
          role,
          is_approved,
          users!message_group_members_user_id_fkey (
            email,
            avatar_url
          )
        `)
        .eq('group_id', groupId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      const formattedMembers: Member[] = membersData.map(member => ({
        id: member.id,
        user_id: member.user_id,
        email: member.users.email,
        joined_at: member.joined_at,
        role: member.role,
        is_approved: member.is_approved
      }));

      console.log('Fetched members:', formattedMembers);
      setMembers(formattedMembers);
    } catch (err) {
      console.error('Error in fetchMembers:', err);
      setError('Failed to load group members');
      toast.error('Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const updateMemberRole = async (memberId: number, newRole: string) => {
    try {
      const { error: updateError } = await supabase
        .from('message_group_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (updateError) throw updateError;

      await fetchMembers();
      toast.success('Member role updated successfully');
    } catch (err) {
      console.error('Error updating member role:', err);
      toast.error('Failed to update member role');
    }
  };

  const removeMember = async (memberId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('message_group_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      await fetchMembers();
      toast.success('Member removed successfully');
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error('Failed to remove member');
    }
  };

  return { members, loading, error, updateMemberRole, removeMember };
};