import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, HardDrive, Save, Trash, CheckCircle, XCircle, AlertCircle, Filter, SortAsc, SortDesc, Search, Cloud } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserFiles } from "@/components/files/UserFiles";
import { Separator } from "@/components/ui/separator";
import { testDropboxConnection } from "@/utils/testDropboxConnection";
import { testDriveConnection } from "@/utils/testDriveConnection";
import { testOneDriveConnection } from "@/utils/testOneDriveConnection";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const StorageSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [oneDriveStatus, setOneDriveStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dropboxStatus, setDropboxStatus] = useState<'checking' | 'connected' | 'error'>('checking');
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
        if (userError) throw userError;
        if (!user) return null;

        const { data: files, error } = await supabase
          .from('user_files')
          .select('size')
          .eq('user_id', user.id);

        if (error) throw error;

        const totalSize = files?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes

        return {
          total_space: maxSize,
          used_space: totalSize,
          files_count: files?.length || 0,
          percentage: (totalSize / maxSize) * 100
        };
      } catch (error) {
        console.error("Error fetching storage info:", error);
        toast.error("Erreur lors de la récupération des informations de stockage");
        return null;
      }
    }
  });

  useEffect(() => {
    const checkConnections = async () => {
      try {
        // Check Google Drive connection
        const driveResult = await testDriveConnection();
        setDriveStatus(driveResult.success ? 'connected' : 'error');
        setDriveError(driveResult.error || null);

        // Check OneDrive connection
        const oneDriveResult = await testOneDriveConnection();
        setOneDriveStatus(oneDriveResult.success ? 'connected' : 'error');

        // Check Dropbox connection
        const dropboxResult = await testDropboxConnection();
        setDropboxStatus(dropboxResult.success ? 'connected' : 'error');
      } catch (error) {
        console.error("Error checking connections:", error);
      }
    };

    checkConnections();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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
          </div>
          <span className="text-sm text-muted-foreground">
            {storageInfo ? formatBytes(storageInfo.used_space) : '0'} utilisés sur {storageInfo ? formatBytes(storageInfo.total_space) : '0'}
          </span>
        </div>
        
        <Progress value={usedPercentage} className="h-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Services de stockage</CardTitle>
              <CardDescription>État des connexions aux services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Supabase Storage</span>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Connecté</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>OneDrive</span>
                </div>
                {oneDriveStatus === 'checking' ? (
                  <span className="text-muted-foreground">Vérification...</span>
                ) : oneDriveStatus === 'connected' ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connecté</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span>Non connecté</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>Google Drive</span>
                </div>
                {driveStatus === 'checking' ? (
                  <span className="text-muted-foreground">Vérification...</span>
                ) : driveStatus === 'connected' ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connecté</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span>Non connecté</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>Dropbox</span>
                </div>
                {dropboxStatus === 'checking' ? (
                  <span className="text-muted-foreground">Vérification...</span>
                ) : dropboxStatus === 'connected' ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connecté</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span>Non connecté</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques de stockage</CardTitle>
              <CardDescription>Répartition de l'espace utilisé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
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
        <UserFiles 
          searchTerm={searchTerm}
          fileType={fileType}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
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