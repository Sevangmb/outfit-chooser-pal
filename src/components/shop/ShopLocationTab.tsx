import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !shop.latitude || !shop.longitude) return;

    mapboxgl.accessToken = process.env.MAPBOX_PUBLIC_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [shop.longitude, shop.latitude],
      zoom: 15
    });

    // Add marker
    new mapboxgl.Marker()
      .setLngLat([shop.longitude, shop.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${shop.name}</h3><p>${shop.address}</p>`))
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
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