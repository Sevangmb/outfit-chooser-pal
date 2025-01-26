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
  onReset: () => void;
}

export const SearchAndFilters = ({
  onSearch,
  onFilterCategory,
  onFilterColor,
  onReset,
}: SearchAndFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleReset = () => {
    setSearchQuery("");
    onReset();
  };

  const handleCategoryChange = (value: string) => {
    onFilterCategory(value === "all" ? "" : value);
  };

  const handleColorChange = (value: string) => {
    onFilterColor(value === "all" ? "" : value);
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
      <div className="flex gap-4">
        <Select onValueChange={handleCategoryChange} defaultValue="all">
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
        <Select onValueChange={handleColorChange} defaultValue="all">
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
      </div>
    </div>
  );
};