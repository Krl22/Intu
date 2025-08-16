import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Configurar el token de acceso
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapComponentProps {
  onLocationSelect?: (coordinates: [number, number], address: string) => void;
  pickupCoords?: [number, number] | null;
  destinationCoords?: [number, number] | null;
  selectionMode?: 'pickup' | 'destination' | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  pickupCoords,
  destinationCoords,
  selectionMode,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const [lng] = useState(-74.5);
  const [lat] = useState(40);
  const [zoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // Inicializar mapa solo una vez

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: zoom,
      });

      // Agregar controles de navegación
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Obtener ubicación actual del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLng = position.coords.longitude;
            const userLat = position.coords.latitude;

            map.current?.setCenter([userLng, userLat]);
            map.current?.setZoom(14);

            // Agregar marcador de ubicación actual
            new mapboxgl.Marker({ color: "blue" })
              .setLngLat([userLng, userLat])
              .setPopup(
                new mapboxgl.Popup().setHTML("<p>Tu ubicación actual</p>")
              )
              .addTo(map.current!);
          },
          (error) => {
            console.log("Error obteniendo ubicación:", error);
          }
        );
      }

      // Evento de clic en el mapa
      map.current.on("click", async (e) => {
        // Solo procesar clics si hay un modo de selección activo
        if (!selectionMode) return;
        
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        // Geocodificación inversa para obtener la dirección
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();
          const address =
            data.features[0]?.place_name || "Dirección desconocida";

          if (onLocationSelect) {
            onLocationSelect(coordinates, address);
          }
        } catch (error) {
          console.error("Error en geocodificación:", error);
        }
      });
    }
  }, [lng, lat, zoom, selectionMode, onLocationSelect]);

  // Efecto para manejar marcador de pickup
  useEffect(() => {
    if (!map.current) return;

    if (pickupCoords) {
      if (pickupMarker.current) {
        pickupMarker.current.remove();
      }
      pickupMarker.current = new mapboxgl.Marker({ color: "green" })
        .setLngLat(pickupCoords)
        .setPopup(new mapboxgl.Popup().setHTML("<p>📍 Origen</p>"))
        .addTo(map.current);
    } else if (pickupMarker.current) {
      pickupMarker.current.remove();
      pickupMarker.current = null;
    }
  }, [pickupCoords]);

  // Efecto para manejar marcador de destination
  useEffect(() => {
    if (!map.current) return;

    if (destinationCoords) {
      if (destinationMarker.current) {
        destinationMarker.current.remove();
      }
      destinationMarker.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat(destinationCoords)
        .setPopup(new mapboxgl.Popup().setHTML("<p>🎯 Destino</p>"))
        .addTo(map.current);
    } else if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }
  }, [destinationCoords]);

  // Efecto para ajustar la vista cuando hay ambas coordenadas
  useEffect(() => {
    if (!map.current || !pickupCoords || !destinationCoords) return;

    const bounds = new mapboxgl.LngLatBounds()
      .extend(pickupCoords)
      .extend(destinationCoords);

    map.current.fitBounds(bounds, {
      padding: 50,
    });
  }, [pickupCoords, destinationCoords]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-64 rounded-xl" />
      <div className="absolute top-2 left-2 bg-white p-2 rounded shadow text-xs">
        {selectionMode ? (
          <span className={`font-semibold ${
            selectionMode === 'pickup' ? 'text-green-600' : 'text-amber-600'
          }`}>
            Selecciona {selectionMode === 'pickup' ? 'origen' : 'destino'}
          </span>
        ) : (
          <span className="text-gray-600">Toca un campo para seleccionar</span>
        )}
      </div>
      {(pickupCoords || destinationCoords) && (
        <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow text-xs space-y-1">
          {pickupCoords && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Origen marcado</span>
            </div>
          )}
          {destinationCoords && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Destino marcado</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
