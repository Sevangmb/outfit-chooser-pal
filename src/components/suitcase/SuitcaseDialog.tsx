import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Luggage } from "lucide-react";
import { SuitcaseForm } from "./SuitcaseForm";

export const SuitcaseDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Luggage className="h-4 w-4" />
          Préparer ma valise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Préparation de ma valise</DialogTitle>
        </DialogHeader>
        <SuitcaseForm />
      </DialogContent>
    </Dialog>
  );
};