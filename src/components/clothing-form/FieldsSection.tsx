import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { BasicFields } from "./fields/BasicFields";
import { CategoryFields } from "./fields/CategoryFields";
import { ColorFields } from "./fields/ColorFields";
import { DetailsFields } from "./fields/DetailsFields";

interface FieldsSectionProps {
  form: UseFormReturn<FormValues>;
}

export const FieldsSection = ({ form }: FieldsSectionProps) => {
  return (
    <div className="space-y-8 bg-background/50 backdrop-blur-sm rounded-lg border border-border p-6">
      <BasicFields form={form} />
      <CategoryFields form={form} />
      <ColorFields form={form} />
      <DetailsFields form={form} />
    </div>
  );
};