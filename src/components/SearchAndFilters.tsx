import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilterCategory: (category: string) => void;
  onFilterColor: (color: string) => void;
  onFilterSource: (source: string) => void;
  onFilterForSale: (forSale: boolean | null) => void;
  onReset: () => void;
}

export const SearchAndFilters = ({
  onSearch,
  onFilterCategory,
  onFilterColor,
  onFilterSource,
  onFilterForSale,
  onReset,
}: SearchAndFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedForSale, setSelectedForSale] = useState("all");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedColor("all");
    setSelectedSource("all");
    setSelectedForSale("all");
    onReset();
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onFilterCategory(value === "all" ? "" : value);
  };

  const handleColorChange = (value: string) => {
    setSelectedColor(value);
    onFilterColor(value === "all" ? "" : value);
  };

  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    onFilterSource(value === "all" ? "" : value);
  };

  const handleForSaleChange = (value: string) => {
    setSelectedForSale(value);
    onFilterForSale(
      value === "all" ? null : value === "true"
    );
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Rechercher un vêtement..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        {searchQuery && (
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="haut">Hauts</SelectItem>
            <SelectItem value="bas">Bas</SelectItem>
            <SelectItem value="chaussure">Chaussures</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedColor} onValueChange={handleColorChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Couleur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les couleurs</SelectItem>
            <SelectItem value="noir">Noir</SelectItem>
            <SelectItem value="blanc">Blanc</SelectItem>
            <SelectItem value="bleu">Bleu</SelectItem>
            <SelectItem value="rouge">Rouge</SelectItem>
            <SelectItem value="vert">Vert</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSource} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sources</SelectItem>
            <SelectItem value="me">Mes vêtements</SelectItem>
            <SelectItem value="friends">Vêtements des amis</SelectItem>
            <SelectItem value="shops">Boutiques</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedForSale} onValueChange={handleForSaleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut de vente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les vêtements</SelectItem>
            <SelectItem value="true">À vendre</SelectItem>
            <SelectItem value="false">Non à vendre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};