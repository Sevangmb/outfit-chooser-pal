import { Button } from "@/components/ui/button";
import { FileText, Trash2, Image, FileIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface FileListProps {
  files: any[];
  onFileClick: (file: any) => void;
  onFileDelete: (fileId: string, filePath: string) => void;
  searchTerm?: string;
  fileType?: "all" | "image" | "document";
  sortBy?: "date" | "name" | "size";
  sortOrder?: "asc" | "desc";
}

export const FileList = ({ 
  files, 
  onFileClick, 
  onFileDelete,
  searchTerm = "",
  fileType = "all",
  sortBy = "date",
  sortOrder = "desc"
}: FileListProps) => {
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = fileType === "all" || 
        (fileType === "image" && file.content_type?.startsWith("image/")) ||
        (fileType === "document" && !file.content_type?.startsWith("image/"));
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "size":
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case "date":
        default:
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="grid gap-4">
      {filteredFiles.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50 hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => onFileClick(file)}
        >
          <div className="flex items-center gap-3">
            {file.content_type?.startsWith("image/") ? (
              <Image className="w-5 h-5 text-muted-foreground" />
            ) : (
              <FileIcon className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">{file.filename}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: fr })}</span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onFileDelete(file.id, file.file_path);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {filteredFiles.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          Aucun fichier trouvé
        </div>
      )}
    </div>
  );
};