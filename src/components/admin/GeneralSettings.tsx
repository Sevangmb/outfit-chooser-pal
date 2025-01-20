import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AppSetting {
  id: string;
  key: string;
  value: string;
  type: 'general' | 'notification' | 'legal';
  description: string;
}

const GeneralSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({});

  const { data: appSettings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('type');
      
      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }
      return data as AppSetting[];
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      const { error } = await supabase.rpc('update_app_setting', {
        p_key: key,
        p_value: value
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast.success('Paramètre mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Error updating setting:', error);
      toast.error('Erreur lors de la mise à jour du paramètre');
    }
  });

  useEffect(() => {
    if (appSettings) {
      const settingsMap = appSettings.reduce((acc, setting) => ({
        ...acc,
        [setting.key]: setting.value
      }), {});
      setSettings(settingsMap);
    }
  }, [appSettings]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSettingUpdate = (key: string) => {
    updateSettingMutation.mutate({ key, value: settings[key] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <CardTitle>Paramètres Généraux</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="legal">Légal</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="app_name">Nom de l'application</Label>
                <Input
                  id="app_name"
                  value={settings.app_name || ''}
                  onChange={(e) => handleSettingChange('app_name', e.target.value)}
                  onBlur={() => handleSettingUpdate('app_name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_description">Description</Label>
                <Textarea
                  id="app_description"
                  value={settings.app_description || ''}
                  onChange={(e) => handleSettingChange('app_description', e.target.value)}
                  onBlur={() => handleSettingUpdate('app_description')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_logo">URL du logo</Label>
                <Input
                  id="app_logo"
                  value={settings.app_logo || ''}
                  onChange={(e) => handleSettingChange('app_logo', e.target.value)}
                  onBlur={() => handleSettingUpdate('app_logo')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notification_email">Notifications par email</Label>
                <Switch
                  id="notification_email"
                  checked={settings.notification_email_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('notification_email_enabled', checked.toString());
                    handleSettingUpdate('notification_email_enabled');
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notification_push">Notifications push</Label>
                <Switch
                  id="notification_push"
                  checked={settings.notification_push_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('notification_push_enabled', checked.toString());
                    handleSettingUpdate('notification_push_enabled');
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="terms">Conditions d'utilisation</Label>
                <Textarea
                  id="terms"
                  value={settings.terms_of_service || ''}
                  onChange={(e) => handleSettingChange('terms_of_service', e.target.value)}
                  onBlur={() => handleSettingUpdate('terms_of_service')}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy">Politique de confidentialité</Label>
                <Textarea
                  id="privacy"
                  value={settings.privacy_policy || ''}
                  onChange={(e) => handleSettingChange('privacy_policy', e.target.value)}
                  onBlur={() => handleSettingUpdate('privacy_policy')}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;