import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PreferenceSettings } from "@/components/settings/PreferenceSettings";
import { StorageSettings } from "@/components/settings/StorageSettings";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { 
  Bell, 
  Lock, 
  Settings2, 
  Shield, 
  User, 
  Database, 
  Languages,
  ChevronRight
} from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid grid-cols-7 gap-2 p-1 bg-muted rounded-lg">
          <TabsTrigger 
            value="account" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger 
            value="privacy" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Confidentialité</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">Préférences</span>
          </TabsTrigger>
          <TabsTrigger 
            value="storage" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Stockage</span>
          </TabsTrigger>
          <TabsTrigger 
            value="delete" 
            className="flex items-center gap-2 text-destructive data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compte</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
              <User className="w-5 h-5" />
              Profil
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <AccountSettings />
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
              <Shield className="w-5 h-5" />
              Confidentialité
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <PrivacySettings />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
              <Lock className="w-5 h-5" />
              Sécurité
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <SecuritySettings />
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
              <Bell className="w-5 h-5" />
              Notifications
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <NotificationSettings />
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
              <Languages className="w-5 h-5" />
              Préférences
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <PreferenceSettings />
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
              <Database className="w-5 h-5" />
              Stockage
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <StorageSettings />
          </Card>
        </TabsContent>

        <TabsContent value="delete">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold text-destructive">
              <Settings2 className="w-5 h-5" />
              Gestion du compte
              <ChevronRight className="w-4 h-4" />
            </div>
            <DeleteAccount />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;