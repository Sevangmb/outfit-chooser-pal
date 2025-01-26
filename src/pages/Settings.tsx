import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { DeleteAccount } from "@/components/settings/DeleteAccount";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="delete" className="text-destructive">
            Suppression
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