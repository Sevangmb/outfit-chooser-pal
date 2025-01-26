import { MapPin } from "lucide-react";

const Shops = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Boutiques</h1>
      
      {/* Carte interactive placeholder */}
      <div className="bg-gray-100 rounded-lg p-4 mb-8 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p>Carte interactive des boutiques</p>
        </div>
      </div>

      {/* Liste des boutiques */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div>
              <h3 className="font-semibold">Nom de la boutique</h3>
              <p className="text-sm text-gray-500">2.5 km • Vêtements, Accessoires</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            ★ 4.5
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shops;