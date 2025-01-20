import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Search } from "lucide-react";

interface FlaggedContent {
  id: number;
  type: 'outfit' | 'comment';
  content: string;
  flag_reason: string;
  created_at: string;
  user?: {
    email: string;
  };
}

export const ContentModeration = () => {
  const [content, setContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFlaggedContent = async () => {
    try {
      console.log('Fetching flagged content...');
      const [outfitsResponse, commentsResponse] = await Promise.all([
        supabase
          .from('outfits')
          .select(`
            id,
            name as content,
            flag_reason,
            created_at,
            profiles!outfits_user_id_fkey (
              email
            )
          `)
          .eq('is_flagged', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('outfit_comments')
          .select(`
            id,
            content,
            flag_reason,
            created_at,
            profiles!outfit_comments_user_id_fkey (
              email
            )
          `)
          .eq('is_flagged', true)
          .order('created_at', { ascending: false })
      ]);

      if (outfitsResponse.error) throw outfitsResponse.error;
      if (commentsResponse.error) throw commentsResponse.error;

      const flaggedOutfits = (outfitsResponse.data || []).map(item => ({
        id: item.id,
        type: 'outfit' as const,
        content: item.content,
        flag_reason: item.flag_reason,
        created_at: item.created_at,
        user: item.profiles
      }));

      const flaggedComments = (commentsResponse.data || []).map(item => ({
        id: item.id,
        type: 'comment' as const,
        content: item.content,
        flag_reason: item.flag_reason,
        created_at: item.created_at,
        user: item.profiles
      }));

      const flaggedContent = [...flaggedOutfits, ...flaggedComments]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('Flagged content:', flaggedContent);
      setContent(flaggedContent);
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      toast.error("Erreur lors du chargement du contenu signalé");
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (id: number, type: 'outfit' | 'comment', action: 'approve' | 'remove') => {
    try {
      console.log('Moderating content:', { id, type, action });
      const { error } = await supabase.rpc(
        type === 'outfit' ? 'moderate_outfit' : 'moderate_comment',
        {
          p_outfit_id: type === 'outfit' ? id : null,
          p_comment_id: type === 'comment' ? id : null,
          p_action: action,
          p_reason: action === 'remove' ? 'Content violates community guidelines' : null
        }
      );

      if (error) throw error;

      toast.success("Contenu modéré avec succès");
      fetchFlaggedContent();
    } catch (error) {
      console.error('Error moderating content:', error);
      toast.error("Erreur lors de la modération du contenu");
    }
  };

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const filteredContent = content.filter(item =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.flag_reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Rechercher dans le contenu signalé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Contenu</TableHead>
            <TableHead>Raison</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContent.map((item) => (
            <TableRow key={`${item.type}-${item.id}`}>
              <TableCell className="capitalize">{item.type}</TableCell>
              <TableCell>{item.content}</TableCell>
              <TableCell>{item.flag_reason}</TableCell>
              <TableCell>{item.user?.email}</TableCell>
              <TableCell>
                {new Date(item.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moderateContent(item.id, item.type, 'approve')}
                    className="text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moderateContent(item.id, item.type, 'remove')}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};