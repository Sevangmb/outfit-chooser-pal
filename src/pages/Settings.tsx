import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PreferenceSettings } from "@/components/settings/PreferenceSettings";
import { StorageSettings } from "@/components/settings/StorageSettings";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { Bell, Lock, Settings2, Shield, User, Database, Languages } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Confidentialité
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Stockage
          </TabsTrigger>
          <TabsTrigger value="delete" className="text-destructive flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Compte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="p-6">
            <AccountSettings />
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6">
            <PrivacySettings />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <SecuritySettings />
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <NotificationSettings />
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="p-6">
            <PreferenceSettings />
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card className="p-6">
            <StorageSettings />
          </Card>
        </TabsContent>

        <TabsContent value="delete">
          <Card className="p-6">
            <DeleteAccount />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;