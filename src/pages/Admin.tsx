import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, List, Ban, Settings, Store, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/admin/UserManagement";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { BannedWords } from "@/components/admin/BannedWords";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { ShopModeration } from "@/components/admin/ShopModeration";
import { GeneralSettings } from "@/components/admin/GeneralSettings";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log("Checking admin status...");
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          console.log("No user found");
          toast.error("Accès non autorisé");
          navigate('/');
          return;
        }

        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.user.id)
          .maybeSingle();

        console.log("Roles response:", roles, "Error:", error);

        if (error) {
          console.error('Error checking admin status:', error);
          toast.error("Erreur lors de la vérification des droits d'accès");
          navigate('/');
          return;
        }
        
        if (!roles || roles.role !== 'admin') {
          console.log("User is not admin:", roles);
          toast.error("Accès non autorisé");
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error("Erreur lors de la vérification des droits d'accès");
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const TabHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              {title}
              <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Administration</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:flex md:space-x-2 gap-2 md:gap-0">
          <TabsTrigger value="users">
            <TabHeader 
              icon={Users} 
              title="Utilisateurs" 
              description="Gérez les utilisateurs, leurs rôles et leurs permissions"
            />
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <TabHeader 
              icon={Ban} 
              title="Modération" 
              description="Modérez le contenu signalé et gérez les infractions"
            />
          </TabsTrigger>
          <TabsTrigger value="shops">
            <TabHeader 
              icon={Store} 
              title="Boutiques" 
              description="Gérez les demandes de création de boutique"
            />
          </TabsTrigger>
          <TabsTrigger value="banned-words">
            <TabHeader 
              icon={Ban} 
              title="Mots bannis" 
              description="Gérez la liste des mots interdits sur la plateforme"
            />
          </TabsTrigger>
          <TabsTrigger value="logs">
            <TabHeader 
              icon={List} 
              title="Logs" 
              description="Consultez l'historique des actions administratives"
            />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <TabHeader 
              icon={Settings} 
              title="Paramètres" 
              description="Configurez les paramètres généraux de l'application"
            />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Modération du contenu</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentModeration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shops">
          <Card>
            <CardHeader>
              <CardTitle>Modération des boutiques</CardTitle>
            </CardHeader>
            <CardContent>
              <ShopModeration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banned-words">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des mots bannis</CardTitle>
            </CardHeader>
            <CardContent>
              <BannedWords />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs d'audit</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogs />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <GeneralSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;