import { useEffect, useState } from "react";

interface Position {
  lat: number;
  lon: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setPosition({
        lat: coords.latitude,
        lon: coords.longitude,
      });
    }, console.error);
  }, []);

  return position;
}
