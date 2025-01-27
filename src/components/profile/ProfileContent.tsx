import { ProfileStats } from "@/components/social/ProfileStats";
import { UserFiles } from "@/components/files/UserFiles";
import { UserOutfits } from "@/components/social/UserOutfits";
import { FollowList } from "@/components/social/FollowList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Medal, Star } from "lucide-react";

interface ProfileContentProps {
  userId: string;
}

export const ProfileContent = ({ userId }: ProfileContentProps) => {
  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Membre depuis</h4>
              <p className="text-sm">Janvier 2024</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Dernière connexion</h4>
              <p className="text-sm">Aujourd'hui</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileStats userId={userId} />
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Nouveau membre</Badge>
            <Badge variant="secondary">Créateur de tenues</Badge>
            <Badge variant="secondary">Contributeur actif</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Abonnés/Abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnés & Abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowList userId={userId} />
        </CardContent>
      </Card>

      {/* Mes tenues */}
      <Card>
        <CardHeader>
          <CardTitle>Mes tenues</CardTitle>
        </CardHeader>
        <CardContent>
          <UserOutfits userId={userId} />
        </CardContent>
      </Card>

      {/* Mes fichiers */}
      <Card>
        <CardHeader>
          <CardTitle>Mes fichiers</CardTitle>
        </CardHeader>
        <CardContent>
          <UserFiles 
            searchTerm=""
            fileType="all"
            sortBy="date"
            sortOrder="desc"
          />
        </CardContent>
      </Card>
    </div>
  );
};