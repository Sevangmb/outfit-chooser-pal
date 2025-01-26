import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddClothingButton } from "./AddClothingButton";
import { AddClothingForm } from "./AddClothingForm";
import { useState } from "react";

export const AddClothingDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AddClothingButton onClick={() => setOpen(true)} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un vêtement</DialogTitle>
        </DialogHeader>
        <AddClothingForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};