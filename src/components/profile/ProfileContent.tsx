import { ProfileStats } from "@/components/social/ProfileStats";
import { UserFiles } from "@/components/files/UserFiles";
import { UserOutfits } from "@/components/social/UserOutfits";
import { FollowList } from "@/components/social/FollowList";

interface ProfileContentProps {
  userId: string;
}

export const ProfileContent = ({ userId }: ProfileContentProps) => {
  return (
    <div className="space-y-6">
      <ProfileStats userId={userId} />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Mes fichiers</h3>
        <UserFiles />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Mes tenues</h3>
        <UserOutfits userId={userId} />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Abonnements</h3>
        <FollowList userId={userId} />
      </div>
    </div>
  );
};