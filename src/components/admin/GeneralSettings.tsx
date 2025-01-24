import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Palette, Bell, Users, Shield } from "lucide-react";
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
  type: 'general' | 'appearance' | 'notification' | 'social' | 'security' | 'legal';
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
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="social">
              <Users className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="legal">
              <Settings className="h-4 w-4 mr-2" />
              Légal
            </TabsTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="app_favicon">URL du favicon</Label>
                <Input
                  id="app_favicon"
                  value={settings.app_favicon || ''}
                  onChange={(e) => handleSettingChange('app_favicon', e.target.value)}
                  onBlur={() => handleSettingUpdate('app_favicon')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Couleur principale</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color || '#0ea5e9'}
                    onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                    onBlur={() => handleSettingUpdate('primary_color')}
                    className="w-20"
                  />
                  <Input
                    value={settings.primary_color || '#0ea5e9'}
                    onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                    onBlur={() => handleSettingUpdate('primary_color')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Couleur secondaire</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={settings.secondary_color || '#64748b'}
                    onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                    onBlur={() => handleSettingUpdate('secondary_color')}
                    className="w-20"
                  />
                  <Input
                    value={settings.secondary_color || '#64748b'}
                    onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                    onBlur={() => handleSettingUpdate('secondary_color')}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark_mode_enabled">Mode sombre</Label>
                <Switch
                  id="dark_mode_enabled"
                  checked={settings.dark_mode_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('dark_mode_enabled', checked.toString());
                    handleSettingUpdate('dark_mode_enabled');
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font_family">Police de caractères</Label>
                <Input
                  id="font_family"
                  value={settings.font_family || ''}
                  onChange={(e) => handleSettingChange('font_family', e.target.value)}
                  onBlur={() => handleSettingUpdate('font_family')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notification_email_enabled">Notifications par email</Label>
                <Switch
                  id="notification_email_enabled"
                  checked={settings.notification_email_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('notification_email_enabled', checked.toString());
                    handleSettingUpdate('notification_email_enabled');
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notification_push_enabled">Notifications push</Label>
                <Switch
                  id="notification_push_enabled"
                  checked={settings.notification_push_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('notification_push_enabled', checked.toString());
                    handleSettingUpdate('notification_push_enabled');
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification_frequency">Fréquence des notifications</Label>
                <Input
                  id="notification_frequency"
                  value={settings.notification_frequency || ''}
                  onChange={(e) => handleSettingChange('notification_frequency', e.target.value)}
                  onBlur={() => handleSettingUpdate('notification_frequency')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="social_sharing_enabled">Partage social</Label>
                <Switch
                  id="social_sharing_enabled"
                  checked={settings.social_sharing_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('social_sharing_enabled', checked.toString());
                    handleSettingUpdate('social_sharing_enabled');
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="comments_enabled">Commentaires</Label>
                <Switch
                  id="comments_enabled"
                  checked={settings.comments_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('comments_enabled', checked.toString());
                    handleSettingUpdate('comments_enabled');
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="likes_enabled">Likes</Label>
                <Switch
                  id="likes_enabled"
                  checked={settings.likes_enabled === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('likes_enabled', checked.toString());
                    handleSettingUpdate('likes_enabled');
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_login_attempts">Tentatives de connexion maximum</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  value={settings.max_login_attempts || '5'}
                  onChange={(e) => handleSettingChange('max_login_attempts', e.target.value)}
                  onBlur={() => handleSettingUpdate('max_login_attempts')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_min_length">Longueur minimale du mot de passe</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={settings.password_min_length || '8'}
                  onChange={(e) => handleSettingChange('password_min_length', e.target.value)}
                  onBlur={() => handleSettingUpdate('password_min_length')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require_email_verification">Vérification de l'email requise</Label>
                <Switch
                  id="require_email_verification"
                  checked={settings.require_email_verification === 'true'}
                  onCheckedChange={(checked) => {
                    handleSettingChange('require_email_verification', checked.toString());
                    handleSettingUpdate('require_email_verification');
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="terms_of_service">Conditions d'utilisation</Label>
                <Textarea
                  id="terms_of_service"
                  value={settings.terms_of_service || ''}
                  onChange={(e) => handleSettingChange('terms_of_service', e.target.value)}
                  onBlur={() => handleSettingUpdate('terms_of_service')}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy_policy">Politique de confidentialité</Label>
                <Textarea
                  id="privacy_policy"
                  value={settings.privacy_policy || ''}
                  onChange={(e) => handleSettingChange('privacy_policy', e.target.value)}
                  onBlur={() => handleSettingUpdate('privacy_policy')}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookie_policy">Politique des cookies</Label>
                <Textarea
                  id="cookie_policy"
                  value={settings.cookie_policy || ''}
                  onChange={(e) => handleSettingChange('cookie_policy', e.target.value)}
                  onBlur={() => handleSettingUpdate('cookie_policy')}
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

export { GeneralSettings };