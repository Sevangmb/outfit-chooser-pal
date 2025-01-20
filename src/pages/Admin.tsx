import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, List, Ban, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/admin/UserManagement";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { BannedWords } from "@/components/admin/BannedWords";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { GeneralSettings } from "@/components/admin/GeneralSettings";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Administration</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Modération
          </TabsTrigger>
          <TabsTrigger value="banned-words" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Mots bannis
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Logs d'audit
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
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