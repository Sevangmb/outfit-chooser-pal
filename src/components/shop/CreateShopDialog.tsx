import { DialogDescription } from "@/components/ui/dialog";
import { ShopProfileForm } from "./ShopProfileForm";
import { Tables } from "@/integrations/supabase/types";

interface CreateShopDialogProps {
  existingShop?: Tables<"shop_profiles"> | null;
}

export const CreateShopDialog = ({ existingShop }: CreateShopDialogProps) => {
  if (existingShop) {
    return <ShopProfileForm existingShop={existingShop} />;
  }

  return (
    <div className="space-y-4">
      <DialogDescription>
        Créez votre profil boutique pour commencer à vendre vos articles.
      </DialogDescription>
      <ShopProfileForm />
    </div>
  );
};