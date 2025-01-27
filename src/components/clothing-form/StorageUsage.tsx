import { Progress } from "@/components/ui/progress";
import { useStorageUsage } from "@/hooks/useStorageUsage";

export const StorageUsage = () => {
  const { storageUsage, isLoading } = useStorageUsage();

  if (isLoading || !storageUsage) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Espace utilisé</span>
        <span>{formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}</span>
      </div>
      <Progress value={storageUsage.percentage} className="h-2" />
    </div>
  );
};