import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, HardDrive, Save, Trash, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserFiles } from "@/components/files/UserFiles";
import { Separator } from "@/components/ui/separator";
import { testOneDriveConnection } from "@/utils/testOneDriveConnection";

export const StorageSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [driveError, setDriveError] = useState<string | null>(null);

  const { data: storageInfo } = useQuery({
    queryKey: ["storage_info"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Simulé pour l'instant - à implémenter avec les vraies données
      return {
        total_space: 1024 * 1024 * 1024, // 1GB en bytes
        used_space: 1024 * 1024 * 100, // 100MB en bytes
        files_count: 25
      };
    },
  });

  useEffect(() => {
    const checkDriveConnection = async () => {
      try {
        const result = await testOneDriveConnection();
        setDriveStatus(result.success ? 'connected' : 'error');
        setDriveError(result.success ? null : result.message || "Erreur de connexion à OneDrive");
      } catch (error) {
        console.error("Error checking OneDrive connection:", error);
        setDriveStatus('error');
        setDriveError(error instanceof Error ? error.message : "Erreur inattendue lors de la vérification");
      }
    };

    checkDriveConnection();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usedPercentage = storageInfo 
    ? (storageInfo.used_space / storageInfo.total_space) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Espace de stockage</h3>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">OneDrive:</span>
              {driveStatus === 'checking' ? (
                <span className="text-muted-foreground">Vérification...</span>
              ) : driveStatus === 'connected' ? (
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Connecté</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span>Non connecté</span>
                  </div>
                  {driveError && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">({driveError})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {storageInfo ? formatBytes(storageInfo.used_space) : '0'} utilisés sur {storageInfo ? formatBytes(storageInfo.total_space) : '0'}
          </span>
        </div>
        
        <Progress value={usedPercentage} className="h-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4" />
              <h4 className="font-medium">Espace total</h4>
            </div>
            <p className="text-2xl font-bold">
              {storageInfo ? formatBytes(storageInfo.total_space) : '0'}
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4" />
              <h4 className="font-medium">Espace utilisé</h4>
            </div>
            <p className="text-2xl font-bold">
              {storageInfo ? formatBytes(storageInfo.used_space) : '0'}
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Save className="w-4 h-4" />
              <h4 className="font-medium">Fichiers</h4>
            </div>
            <p className="text-2xl font-bold">
              {storageInfo?.files_count || 0}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Mes fichiers</h3>
        <UserFiles />
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Gestion du stockage</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={() => toast.info("Fonctionnalité à venir")}>
            <Trash className="w-4 h-4 mr-2" />
            Nettoyer le stockage
          </Button>
        </div>
      </div>
    </div>
  );
};