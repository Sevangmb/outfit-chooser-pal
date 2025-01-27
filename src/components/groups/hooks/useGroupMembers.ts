import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Member } from '../types/member';

export const useGroupMembers = (groupId: number) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
            is_approved
          `)
          .eq('group_id', groupId);

        if (membersError) {
          console.error('Error fetching members:', membersError);
          throw membersError;
        }

        if (!membersData) {
          console.log('No members found for group:', groupId);
          setMembers([]);
          return;
        }

        // Fetch user details for each member
        const userIds = membersData.map(member => member.user_id);
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }

        // Create a map of user emails
        const userMap = new Map(users?.map(u => [u.id, u.email]));

        // Combine member data with user data
        const formattedMembers = membersData.map(member => ({
          id: member.id,
          userId: member.user_id,
          email: userMap.get(member.user_id) || 'Unknown User',
          joinedAt: member.joined_at,
          role: member.role,
          isApproved: member.is_approved
        }));

        console.log('Formatted members:', formattedMembers);
        setMembers(formattedMembers);

      } catch (err) {
        console.error('Error in useGroupMembers:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);

  return { members, loading, error };
};