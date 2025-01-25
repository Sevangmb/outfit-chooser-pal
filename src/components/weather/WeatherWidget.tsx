import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Loader2, CloudSun, Moon, Snowflake, CloudFog } from "lucide-react";

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
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        
        console.log("Fetching weather for coordinates:", latitude, longitude);
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        console.log("Weather data received:", data);

        const weatherData = {
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
        };

        setWeather(weatherData);

        // Store weather data in localStorage for the AI suggestion feature
        localStorage.setItem('weatherData', JSON.stringify({
          temperature: data.current.temperature_2m,
          description: getWeatherDescription(data.current.weather_code),
          conditions: getWeatherConditions(data.current.weather_code)
        }));

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
    switch (true) {
      case code === 0: // Clear sky
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case code === 1 || code === 2: // Partly cloudy
        return <CloudSun className="h-6 w-6 text-gray-500" />;
      case code === 3: // Overcast
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case code >= 51 && code <= 67: // Drizzle and Rain
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case code >= 71 && code <= 77: // Snow
        return <Snowflake className="h-6 w-6 text-blue-300" />;
      case code >= 45 && code <= 48: // Foggy
        return <CloudFog className="h-6 w-6 text-gray-400" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getWeatherDescription = (code: number) => {
    switch (true) {
      case code === 0:
        return "Ciel dégagé";
      case code === 1:
        return "Peu nuageux";
      case code === 2:
        return "Partiellement nuageux";
      case code === 3:
        return "Couvert";
      case code >= 51 && code <= 67:
        return "Pluie";
      case code >= 71 && code <= 77:
        return "Neige";
      case code >= 45 && code <= 48:
        return "Brouillard";
      default:
        return "Conditions variables";
    }
  };

  const getWeatherConditions = (code: number) => {
    const conditions = [];
    
    if (code >= 51 && code <= 67) {
      conditions.push('rain');
    }
    if (code >= 71 && code <= 77) {
      conditions.push('snow');
    }
    if (code >= 45 && code <= 48) {
      conditions.push('fog');
    }
    
    return conditions;
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
        <div>
          <h3 className="font-medium">Météo aujourd'hui</h3>
          {weather && !loading && (
            <p className="text-sm text-muted-foreground">
              {getWeatherDescription(weather.weatherCode)}
            </p>
          )}
        </div>
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
