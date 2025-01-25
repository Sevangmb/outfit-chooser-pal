import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ShopProfile {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  status: string;
  created_at: string;
  user: {
    email: string;
  } | null;
}

export const ShopModeration = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: shops, isLoading, refetch } = useQuery({
    queryKey: ["pendingShops"],
    queryFn: async () => {
      console.log('Fetching pending shops...');
      const { data, error } = await supabase
        .from('shop_profiles')
        .select(`
          *,
          user:profiles!inner(email)
        `)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending shops:', error);
        throw error;
      }

      return data as ShopProfile[];
    },
  });

  const moderateShop = async (shopId: string, action: 'approve' | 'reject') => {
    try {
      console.log('Moderating shop:', { shopId, action });
      const { error } = await supabase
        .from('shop_profiles')
        .update({ 
          status: action === 'approve' ? 'active' : 'rejected',
        })
        .eq('id', shopId);

      if (error) throw error;

      toast.success(`Boutique ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`);
      refetch();
    } catch (error) {
      console.error('Error moderating shop:', error);
      toast.error("Erreur lors de la modération de la boutique");
    }
  };

  const filteredShops = shops?.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Rechercher une boutique..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Propriétaire</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredShops?.map((shop) => (
            <TableRow key={shop.id}>
              <TableCell className="font-medium">{shop.name}</TableCell>
              <TableCell>{shop.description}</TableCell>
              <TableCell>{shop.user?.email}</TableCell>
              <TableCell>
                {new Date(shop.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moderateShop(shop.id, 'approve')}
                    className="text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moderateShop(shop.id, 'reject')}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredShops?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                Aucune boutique en attente de modération
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};