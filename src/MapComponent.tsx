import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Configurar el token de acceso
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapComponentProps {
  onLocationSelect?: (coordinates: [number, number], address: string) => void;
  pickupCoords?: [number, number] | null;
  destinationCoords?: [number, number] | null;
  selectionMode?: "pickup" | "destination" | null;
  routeData?: any;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  pickupCoords,
  destinationCoords,
  selectionMode,
  routeData,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  // Coordenadas de Santiago de Surco, Lima para desarrollo
  const [lng] = useState(-76.9999);
  const [lat] = useState(-12.1348);
  const [zoom] = useState(13);
  const [isConfirmingLocation, setIsConfirmingLocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

      // Intentar obtener ubicación actual del usuario, pero usar Santiago de Surco como fallback
      if (navigator.geolocation) {
        setIsGettingLocation(true);
        // Configuración optimizada para móviles
        const geoOptions = {
          enableHighAccuracy: false, // Usar red/WiFi en lugar de GPS para mayor velocidad
          timeout: 10000, // Timeout de 10 segundos
          maximumAge: 300000, // Usar ubicación cacheada de hasta 5 minutos
        };

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userLng = position.coords.longitude;
            const userLat = position.coords.latitude;

            map.current?.setCenter([userLng, userLat]);
            map.current?.setZoom(14);

            // Agregar marcador de ubicación actual (azul)
            new mapboxgl.Marker({ color: "blue" })
              .setLngLat([userLng, userLat])
              .setPopup(
                new mapboxgl.Popup().setHTML("<p>Tu ubicación actual</p>")
              )
              .addTo(map.current!);

            // Geocodificación inversa para obtener la dirección
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLng},${userLat}.json?access_token=${mapboxgl.accessToken}`
              );
              const data = await response.json();
              const address =
                data.features[0]?.place_name || "Ubicación actual";

              // Establecer automáticamente como punto de origen
              if (onLocationSelect) {
                onLocationSelect([userLng, userLat], address);
              }
            } catch (error) {
              console.error(
                "Error en geocodificación de ubicación actual:",
                error
              );
              // Si falla la geocodificación, usar coordenadas como fallback
              if (onLocationSelect) {
                onLocationSelect(
                  [userLng, userLat],
                  `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`
                );
              }
            }

            setIsGettingLocation(false);
          },
          (error) => {
            console.log(
              "Error obteniendo ubicación, usando Santiago de Surco como ubicación por defecto:",
              error
            );
            setIsGettingLocation(false);
            // En caso de error de geolocalización, mantener Santiago de Surco como centro
          },
          geoOptions // ← Agregar las opciones aquí
        );
      } else {
        console.log(
          "Geolocalización no disponible, usando Santiago de Surco como ubicación por defecto"
        );
        // Si no hay geolocalización disponible, el mapa ya está centrado en Santiago de Surco
      }

      // Remover el evento de clic ya que ahora usamos el pin central
    }
  }, [lng, lat, zoom]);

  // Efecto para limpiar la ruta cuando no hay routeData
  useEffect(() => {
    if (!map.current) return;

    if (!routeData && map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }
  }, [routeData]);

  // Efecto para mostrar la ruta en el mapa
  useEffect(() => {
    if (!map.current || !routeData) return;

    const addRouteToMap = () => {
      if (!map.current) return;

      // Remover ruta anterior si existe
      if (map.current.getSource("route")) {
        map.current.removeLayer("route");
        map.current.removeSource("route");
      }

      // Agregar la nueva ruta
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: routeData.geometry,
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#10B981", // Verde de Tailwind
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });

      // Ajustar la vista del mapa para mostrar toda la ruta
      if (pickupCoords && destinationCoords) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(pickupCoords);
        bounds.extend(destinationCoords);

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    };

    // Verificar si el estilo está cargado
    if (map.current.isStyleLoaded()) {
      addRouteToMap();
    } else {
      // Esperar a que el estilo termine de cargar
      map.current.once("styledata", addRouteToMap);
    }
  }, [routeData, pickupCoords, destinationCoords]);

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

  // Función para confirmar la ubicación del pin central
  const handleConfirmLocation = async () => {
    if (!map.current || !selectionMode) return;

    const center = map.current.getCenter();
    const coordinates: [number, number] = [center.lng, center.lat];

    setIsConfirmingLocation(true);
    try {
      // Geocodificación inversa para obtener la dirección
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      const address = data.features[0]?.place_name || "Dirección desconocida";

      if (onLocationSelect) {
        onLocationSelect(coordinates, address);
      }
    } catch (error) {
      console.error("Error en geocodificación:", error);
    } finally {
      setIsConfirmingLocation(false);
    }
  };

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-64 rounded-xl" />

      {/* Pin central fijo */}
      {selectionMode && (
        <>
          {/* Pin central */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
            <div
              className={`text-3xl drop-shadow-lg ${
                selectionMode === "pickup" ? "text-green-600" : "text-red-600"
              }`}
            >
              📍
            </div>
          </div>

          {/* Botón de confirmación */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-4 w-full max-w-xs">
            <button
              onClick={handleConfirmLocation}
              disabled={isConfirmingLocation}
              className={`w-full px-4 py-3 rounded-full font-semibold text-white shadow-lg transition-all text-sm sm:text-base ${
                selectionMode === "pickup"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isConfirmingLocation ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Confirmando...</span>
                </span>
              ) : (
                `✓ Confirmar ${
                  selectionMode === "pickup" ? "origen" : "destino"
                }`
              )}
            </button>
          </div>
        </>
      )}

      {/* Indicador de estado */}
      <div className="absolute top-2 left-2 bg-white p-2 rounded shadow text-xs">
        {isGettingLocation ? (
          <span className="text-blue-600 font-semibold flex items-center space-x-1">
            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
            <span>📍 Obteniendo ubicación...</span>
          </span>
        ) : selectionMode ? (
          <span
            className={`font-semibold ${
              selectionMode === "pickup" ? "text-green-600" : "text-red-600"
            }`}
          >
            {selectionMode === "pickup"
              ? "📍 Mueve el mapa para elegir origen"
              : "🎯 Mueve el mapa para elegir destino"}
          </span>
        ) : (
          <span className="text-gray-600">Toca un campo para seleccionar</span>
        )}
      </div>

      {/* Indicadores de ubicaciones marcadas */}
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
