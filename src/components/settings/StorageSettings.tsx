import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, HardDrive, Save, Trash, CheckCircle, XCircle, AlertCircle, Filter, SortAsc, SortDesc, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserFiles } from "@/components/files/UserFiles";
import { Separator } from "@/components/ui/separator";
import { testDropboxConnection } from "@/utils/testDropboxConnection";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const StorageSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [driveError, setDriveError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fileType, setFileType] = useState<"all" | "image" | "document">("all");

  const { data: storageInfo, refetch: refetchStorageInfo } = useQuery({
    queryKey: ["storage_info"],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Error refreshing session:", refreshError);
            toast.error("Votre session a expiré. Veuillez vous reconnecter.");
            await supabase.auth.signOut();
            return null;
          }
          if (!refreshData.session) {
            throw new Error("No session after refresh");
          }
        }
        
        if (!user) return null;

        // Simulé pour l'instant - à implémenter avec les vraies données
        return {
          total_space: 1024 * 1024 * 1024, // 1GB en bytes
          used_space: 1024 * 1024 * 100, // 100MB en bytes
          files_count: 25
        };
      } catch (error) {
        console.error("Error fetching storage info:", error);
        toast.error("Erreur lors de la récupération des informations de stockage");
        return null;
      }
    },
    retry: 1
  });

  useEffect(() => {
    const checkDropboxConnection = async () => {
      try {
        setDriveStatus('checking');
        setDriveError(null);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            throw new Error("Session expired. Please login again.");
          }
        }

        console.log("Checking Dropbox connection...");
        const result = await testDropboxConnection();
        
        if (result.success) {
          console.log("Dropbox connection successful");
          setDriveStatus('connected');
          setDriveError(null);
        } else {
          console.error("Dropbox connection failed:", result.error);
          setDriveStatus('error');
          setDriveError(result.error || "Erreur de connexion à Dropbox");
        }
      } catch (error) {
        console.error("Error checking Dropbox connection:", error);
        setDriveStatus('error');
        setDriveError(error instanceof Error ? error.message : "Erreur inattendue lors de la vérification");
      }
    };

    checkDropboxConnection();
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

  const handleBulkDelete = async (selectedFiles: string[]) => {
    try {
      setIsLoading(true);
      // Implement bulk delete logic here
      toast.success("Fichiers supprimés avec succès");
      refetchStorageInfo();
    } catch (error) {
      console.error("Error deleting files:", error);
      toast.error("Erreur lors de la suppression des fichiers");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Espace de stockage</h3>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Dropbox:</span>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Mes fichiers</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <Select value={fileType} onValueChange={(value: "all" | "image" | "document") => setFileType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de fichier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les fichiers</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SortAsc className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  Par date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Par nom
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("size")}>
                  Par taille
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
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