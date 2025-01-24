import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

interface FileListProps {
  files: any[];
  onFileClick: (file: any) => void;
  onFileDelete: (fileId: string, filePath: string) => void;
}

export const FileList = ({ files, onFileClick, onFileDelete }: FileListProps) => {
  return (
    <div className="grid gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50 cursor-pointer"
          onClick={() => onFileClick(file)}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{file.filename}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(file.created_at).toLocaleDateString()}
              </p>
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
    </div>
  );
};