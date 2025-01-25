import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ShopLocationTabProps {
  shop: {
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export const ShopLocationTab = ({ shop }: ShopLocationTabProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !shop.latitude || !shop.longitude) return;

    // Initialize map if not already initialized
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([shop.latitude, shop.longitude], 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);

      // Add marker for the shop
      L.marker([shop.latitude, shop.longitude])
        .addTo(map.current)
        .bindPopup(`<b>${shop.name}</b><br>${shop.address}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [shop]);

  if (!shop.latitude || !shop.longitude) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune localisation disponible</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden mt-4">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};