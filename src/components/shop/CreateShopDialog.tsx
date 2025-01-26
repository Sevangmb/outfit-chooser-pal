import { DialogDescription } from "@/components/ui/dialog";
import { ShopProfileForm } from "./ShopProfileForm";
import { Tables } from "@/integrations/supabase/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store } from "lucide-react";

interface CreateShopDialogProps {
  existingShop?: Tables<"shop_profiles"> | null;
  onSuccess?: () => void;
}

export const CreateShopDialog = ({ existingShop, onSuccess }: CreateShopDialogProps) => {
  if (existingShop) {
    return <ShopProfileForm existingShop={existingShop} onSuccess={onSuccess} />;
  }

  return (
    <div className="space-y-6">
      <DialogDescription className="text-center">
        Créez votre profil boutique pour commencer à vendre vos articles.
      </DialogDescription>

      <Alert>
        <Store className="h-4 w-4" />
        <AlertDescription>
          En créant une boutique, vous pourrez vendre vos vêtements et accessoires à la communauté.
          Votre boutique sera visible sur la carte et dans la liste des boutiques.
        </AlertDescription>
      </Alert>

      <ShopProfileForm onSuccess={onSuccess} />
    </div>
  );
};