import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ClothingCard } from "./ClothingCard";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
  user_id: string;
}

interface ClothingSectionProps {
  title: string;
  items: Clothing[];
  isMobile?: boolean;
}

export const ClothingSection = ({ title, items, isMobile = false }: ClothingSectionProps) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-primary mb-4 px-4">{title}</h2>
    {isMobile ? (
      <div className="grid grid-cols-1 gap-4 px-2">
        {items.length === 0 ? (
          <div className="text-muted-foreground text-center py-8 bg-secondary/30 rounded-lg">
            Aucun vêtement dans cette catégorie
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id}>
              <ClothingCard
                id={item.id}
                image={item.image}
                name={item.name}
                category={item.category}
                color={item.color}
              />
            </div>
          ))
        )}
      </div>
    ) : (
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex w-full space-x-4 p-4">
          {items.length === 0 ? (
            <div className="flex-none w-full">
              <div className="text-muted-foreground text-center py-8 bg-secondary/30 rounded-lg">
                Aucun vêtement dans cette catégorie
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex-none w-[250px]">
                <ClothingCard
                  id={item.id}
                  image={item.image}
                  name={item.name}
                  category={item.category}
                  color={item.color}
                />
              </div>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )}
  </div>
);