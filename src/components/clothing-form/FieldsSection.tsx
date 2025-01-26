import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { BasicFields } from "./fields/BasicFields";
import { CategoryFields } from "./fields/CategoryFields";
import { ColorFields } from "./fields/ColorFields";
import { DetailsFields } from "./fields/DetailsFields";
import { SaleFields } from "./fields/SaleFields";
import { TagsField } from "./fields/TagsField";

interface FieldsSectionProps {
  form: UseFormReturn<FormValues>;
}

export const FieldsSection = ({ form }: FieldsSectionProps) => {
  return (
    <div className="space-y-8">
      <BasicFields form={form} />
      <CategoryFields form={form} />
      <ColorFields form={form} />
      <TagsField form={form} />
      <DetailsFields form={form} />
      <SaleFields form={form} />
    </div>
  );
};