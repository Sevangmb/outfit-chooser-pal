import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, List, Ban, Settings, Store, HelpCircle, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/admin/UserManagement";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { BannedWords } from "@/components/admin/BannedWords";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { ShopModeration } from "@/components/admin/ShopModeration";
import { GeneralSettings } from "@/components/admin/GeneralSettings";
import { ChallengeManagement } from "@/components/admin/ChallengeManagement";
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Administration</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:flex md:space-x-2 gap-2 md:gap-0">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="shops">
            <Store className="h-4 w-4 mr-2" />
            Boutiques
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <Ban className="h-4 w-4 mr-2" />
            Modération
          </TabsTrigger>
          <TabsTrigger value="banned-words">
            <Ban className="h-4 w-4 mr-2" />
            Mots bannis
          </TabsTrigger>
          <TabsTrigger value="logs">
            <List className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Trophy className="h-4 w-4 mr-2" />
            Challenges
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

        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <ChallengeManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
