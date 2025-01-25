import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Loader2 } from "lucide-react";

interface WeatherData {
  temperature: number;
  weatherCode: number;
}

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // First get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        
        console.log("Fetching weather for coordinates:", latitude, longitude);
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        console.log("Weather data received:", data);

        setWeather({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
        });
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Impossible de récupérer la météo");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    if (code === 0) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (code >= 51 && code <= 67) return <CloudRain className="h-6 w-6 text-blue-500" />;
    return <Cloud className="h-6 w-6 text-gray-500" />;
  };

  if (error) {
    return (
      <Card className="p-4 bg-destructive/10 text-destructive">
        <p className="text-sm">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Météo locale</h3>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : weather ? (
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather.weatherCode)}
            <span className="text-lg font-semibold">
              {Math.round(weather.temperature)}°C
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
};