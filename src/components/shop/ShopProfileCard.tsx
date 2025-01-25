import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Globe } from "lucide-react";

interface ShopProfileCardProps {
  shop: {
    name: string;
    description: string;
    address: string;
    phone: string;
    website: string;
    is_verified: boolean;
    status: string;
  };
}

export const ShopProfileCard = ({ shop }: ShopProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{shop.name}</CardTitle>
          <div className="flex gap-2">
            {shop.is_verified && (
              <Badge variant="default">Vérifié</Badge>
            )}
            <Badge variant="secondary">{shop.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{shop.description}</p>
        
        <div className="space-y-2">
          {shop.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{shop.address}</span>
            </div>
          )}
          
          {shop.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>{shop.phone}</span>
            </div>
          )}
          
          {shop.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              <a 
                href={shop.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {shop.website}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};