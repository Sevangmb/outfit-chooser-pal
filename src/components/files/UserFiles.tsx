import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileList } from "./FileList";
import { toast } from "sonner";

interface UserFilesProps {
  searchTerm: string;
  fileType: "all" | "image" | "document";
  sortBy: "date" | "name" | "size";
  sortOrder: "asc" | "desc";
}

export const UserFiles = ({ searchTerm, fileType, sortBy, sortOrder }: UserFilesProps) => {
  const { data: files, isLoading } = useQuery({
    queryKey: ["user_files", searchTerm, fileType, sortBy, sortOrder],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching files:", error);
        toast.error("Erreur lors du chargement des fichiers");
        return [];
      }

      return data || [];
    }
  });

  const handleFileClick = (file: any) => {
    // Handle file click
    console.log("File clicked:", file);
  };

  const handleFileDelete = async (fileId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('user_files')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast.success("Fichier supprimé avec succès");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Erreur lors de la suppression du fichier");
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <FileList
      files={files || []}
      onFileClick={handleFileClick}
      onFileDelete={handleFileDelete}
      searchTerm={searchTerm}
      fileType={fileType}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  );
};
