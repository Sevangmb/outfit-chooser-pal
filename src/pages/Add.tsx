import { AddClothingForm } from "@/components/AddClothingForm";

const Add = () => {
  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Ajouter un vêtement</h1>
      <AddClothingForm />
    </div>
  );
};

export default Add;