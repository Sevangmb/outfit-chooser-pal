import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddClothingButton } from "./AddClothingButton";
import { AddClothingForm } from "./AddClothingForm";
import { useState } from "react";

export const AddClothingDialog = () => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <AddClothingButton onClick={() => handleOpenChange(true)} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un vêtement</DialogTitle>
        </DialogHeader>
        <AddClothingForm onSuccess={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};