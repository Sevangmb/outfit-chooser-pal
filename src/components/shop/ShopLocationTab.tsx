import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';
import { toast } from 'sonner';

interface Shop {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface ShopLocationTabProps {
  shops: Shop[];
}

export const ShopLocationTab = ({ shops }: ShopLocationTabProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const centerMapOnUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        if (map.current) {
          map.current.setView([latitude, longitude], 13);
          
          // Add or update user location marker
          if (userLocation) {
            L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'bg-primary rounded-full w-4 h-4 -ml-2 -mt-2',
                iconSize: [16, 16]
              })
            })
              .addTo(map.current)
              .bindPopup('Votre position');
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error("Impossible d'obtenir votre position");
      }
    );
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if not already initialized
    if (!map.current) {
      // Find center point from all shops or default to Paris
      const validShops = shops.filter(shop => shop.latitude && shop.longitude);
      let initialCenter: [number, number] = [48.8566, 2.3522]; // Paris coordinates
      let initialZoom = 5;

      if (validShops.length > 0) {
        const latitudes = validShops.map(shop => shop.latitude!);
        const longitudes = validShops.map(shop => shop.longitude!);
        const centerLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
        const centerLng = (Math.max(...longitudes) + Math.min(...longitudes)) / 2;
        initialCenter = [centerLat, centerLng];
        initialZoom = 10;
      }

      map.current = L.map(mapContainer.current).setView(initialCenter, initialZoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);

      // Initialize markers layer
      markersLayer.current = L.layerGroup().addTo(map.current);
    }

    // Clear existing markers
    if (markersLayer.current) {
      markersLayer.current.clearLayers();
    }

    // Add markers for all shops
    shops.forEach(shop => {
      if (shop.latitude && shop.longitude) {
        L.marker([shop.latitude, shop.longitude])
          .addTo(markersLayer.current!)
          .bindPopup(`<b>${shop.name}</b><br>${shop.address}`);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [shops]);

  if (shops.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune boutique disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          onClick={centerMapOnUserLocation}
        >
          <Locate className="h-4 w-4" />
          Ma position
        </Button>
      </div>
      <div className="h-[400px] w-full rounded-lg overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};