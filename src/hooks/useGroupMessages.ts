import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: number;
  content: string;
  created_at: string;
  sender: {
    id: string;
    email: string;
    avatar_url?: string;
  };
}

export const useGroupMessages = (groupId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('group_messages')
          .select(`
            id,
            content,
            created_at,
            sender:users(id, email, avatar_url)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        if (messagesData) {
          setMessages(messagesData as Message[]);
        }
      } catch (err) {
        console.error('Error fetching group messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`group_messages:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload) => {
        const { data: newMessage, error: messageError } = await supabase
          .from('group_messages')
          .select(`
            id,
            content,
            created_at,
            sender:users(id, email, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!messageError && newMessage) {
          setMessages(prev => [...prev, newMessage as Message]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [groupId]);

  return { messages, loading, error };
};