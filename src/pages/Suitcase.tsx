import { SuitcaseForm } from "@/components/suitcase/SuitcaseForm";

const Suitcase = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Préparation de ma valise</h2>
        <SuitcaseForm />
      </div>
    </div>
  );
};

export default Suitcase;