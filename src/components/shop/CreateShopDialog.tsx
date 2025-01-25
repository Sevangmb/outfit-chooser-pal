import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShopProfileForm } from "./ShopProfileForm";
import { Building2 } from "lucide-react";

export const CreateShopDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          Créer ma boutique
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un profil boutique</DialogTitle>
          <DialogDescription>
            Créez votre profil boutique pour commencer à vendre vos articles.
          </DialogDescription>
        </DialogHeader>
        <ShopProfileForm />
      </DialogContent>
    </Dialog>
  );
};