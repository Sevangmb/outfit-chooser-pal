import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
}

interface ClothingCarouselProps {
  items: Clothing[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  title: string;
}

export const ClothingCarousel = ({ items, selectedId, onSelect, title }: ClothingCarouselProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center">{title}</h3>
      <Carousel className="w-full max-w-xs mx-auto">
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id}>
              <div 
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedId === item.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onSelect(item.id)}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};