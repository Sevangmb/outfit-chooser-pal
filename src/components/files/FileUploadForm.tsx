import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileUploadFormProps {
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadForm = ({ uploading, onFileUpload }: FileUploadFormProps) => {
  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        onChange={onFileUpload}
        disabled={uploading}
        className="flex-1"
      />
      <Button disabled={uploading}>
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Upload en cours..." : "Upload"}
      </Button>
    </div>
  );
};