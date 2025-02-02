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
import { Plus, Trash2 } from "lucide-react";

interface BannedWord {
  id: string;
  word: string;
  created_at: string;
  users: {
    email: string;
  } | null;
}

export const BannedWords = () => {
  const [words, setWords] = useState<BannedWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(true);

  const checkSupabaseConnection = () => {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      toast.error("Erreur de connexion à la base de données. Veuillez réessayer plus tard.");
      return false;
    }
    return true;
  };

  const fetchWords = async () => {
    if (!checkSupabaseConnection()) return;
    try {
      console.log('Fetching banned words...');
      const { data, error } = await supabase
        .from('banned_words')
        .select(`
          *,
          users:profiles!banned_words_created_by_user_id_fkey (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Unexpected error occurred while fetching banned words:', error);
        toast.error("Une erreur inattendue est survenue lors du chargement des mots bannis. Veuillez réessayer plus tard.");
        return;
      }

      console.log('Banned words:', data);
      setWords(data || []);
    } catch (error) {
      console.error('Error fetching banned words:', error);
      toast.error("Erreur lors du chargement des mots bannis");
    } finally {
      setLoading(false);
    }
  };

  const addWord = async () => {
    if (!checkSupabaseConnection() || !newWord.trim()) return;

    try {
      console.log('Adding banned word:', newWord);
      const { error } = await supabase
        .from('banned_words')
        .insert({ word: newWord.toLowerCase().trim() });

      if (error) {
        console.error('Unexpected error occurred while adding banned word:', error);
        toast.error("Une erreur inattendue est survenue lors de l'ajout du mot banni. Veuillez réessayer plus tard.");
        return;
      }

      toast.success("Mot banni ajouté");
      setNewWord("");
      fetchWords();
    } catch (error) {
      console.error('Error adding banned word:', error);
      toast.error("Erreur lors de l'ajout du mot banni");
    }
  };

  const removeWord = async (id: string) => {
    if (!checkSupabaseConnection()) return;

    try {
      console.log('Removing banned word:', id);
      const { error } = await supabase
        .from('banned_words')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Unexpected error occurred while removing banned word:', error);
        toast.error("Une erreur inattendue est survenue lors de la suppression du mot banni. Veuillez réessayer plus tard.");
        return;
      }

      toast.success("Mot banni supprimé");
      fetchWords();
    } catch (error) {
      console.error('Error removing banned word:', error);
      toast.error("Erreur lors de la suppression du mot banni");
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Nouveau mot banni..."
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addWord()}
        />
        <Button onClick={addWord} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mot</TableHead>
            <TableHead>Ajouté par</TableHead>
            <TableHead>Date d'ajout</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow key={word.id}>
              <TableCell>{word.word}</TableCell>
              <TableCell>{word.users?.email}</TableCell>
              <TableCell>
                {new Date(word.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeWord(word.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};