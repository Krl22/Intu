import React, { useState, useEffect, useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

// Configuración de Mapbox
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapComponentProps {
  className?: string;
  isSelectingDestination?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  routeCoordinates?: [number, number][] | null;
  userLocation?: [number, number] | null;
  fitRoutePadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  destinationLocation?: [number, number] | null;
}

// Componente personalizado para marcadores
const CustomMarker: React.FC<{
  longitude: number;
  latitude: number;
  color?: string;
  title?: string;
  anchor?: "center" | "bottom";
}> = ({ longitude, latitude, color = "#3B82F6", title, anchor = "center" }) => {
  return (
    <Marker 
      longitude={longitude} 
      latitude={latitude}
      anchor={anchor}
    >
      <div
        className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer"
        style={{ backgroundColor: color }}
        title={title}
      />
    </Marker>
  );
};

const MapComponent: React.FC<MapComponentProps> = ({
  className = "",
  isSelectingDestination = false,
  onCenterChange,
  routeCoordinates = null,
  userLocation: propUserLocation = null,
  fitRoutePadding,
  destinationLocation = null,
}) => {
  const [internalUserLocation, setInternalUserLocation] = useState<
    [number, number] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -71.0589,
    latitude: 42.3601,
    zoom: 12,
  });
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Evitar re-encuadre mientras se selecciona destino
    if (isSelectingDestination) return;
    if (!routeCoordinates || routeCoordinates.length < 2) return;
    const map = mapRef.current?.getMap?.() || mapRef.current;
    if (!map || !map.fitBounds) return;

    // Calcular bounds (lat,lng -> lng,lat)
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    for (const [lat, lng] of routeCoordinates) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    const ne: [number, number] = [maxLng, maxLat];
    const sw: [number, number] = [minLng, minLat];

    const padding = {
      top: fitRoutePadding?.top ?? 24,
      right: fitRoutePadding?.right ?? 24,
      bottom: fitRoutePadding?.bottom ?? 24,
      left: fitRoutePadding?.left ?? 24,
    } as any;

    try {
      map.fitBounds([sw, ne], { padding, duration: 700 });
    } catch (e) {
      // Ignorar errores de encuadre
    }
  }, [routeCoordinates, fitRoutePadding, isSelectingDestination]);

  // Usar la ubicación de la prop o la interna
  const currentUserLocation = propUserLocation || internalUserLocation;

  // Ubicación por defecto (Boston)
  const defaultLocation: [number, number] = [42.3601, -71.0589];

  // Función para validar coordenadas
  const isValidCoordinate = (
    coord: [number, number] | null
  ): coord is [number, number] => {
    return (
      coord !== null &&
      !isNaN(coord[0]) &&
      !isNaN(coord[1]) &&
      isFinite(coord[0]) &&
      isFinite(coord[1])
    );
  };

  // Obtener ubicación del usuario solo si no se proporciona una
  useEffect(() => {
    if (propUserLocation) {
      // Si se proporciona una ubicación, centrar el mapa en ella
      setViewState({
        longitude: propUserLocation[1],
        latitude: propUserLocation[0],
        zoom: 15,
      });
      setIsLoading(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInternalUserLocation([latitude, longitude]);
          // Centrar automáticamente el mapa en la ubicación del usuario
          setViewState({
            longitude,
            latitude,
            zoom: 15,
          });
          setIsLoading(false);
        },
        (error) => {
          console.warn("Error obteniendo ubicación:", error);
          setError("No se pudo obtener la ubicación actual");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setError("Geolocalización no soportada");
      setIsLoading(false);
    }
  }, [propUserLocation]);

  const handleGetLocation = () => {
    setIsLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInternalUserLocation([latitude, longitude]);
          // Centrar el mapa en la nueva ubicación
          setViewState({
            longitude,
            latitude,
            zoom: 15,
          });
          setIsLoading(false);
        },
        (error) => {
          console.warn("Error obteniendo ubicación:", error);
          setError("No se pudo obtener la ubicación actual");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  return (
    <div className={`relative ${className} h-full w-full`}>
      {/* Indicador de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Obteniendo ubicación...</p>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="z-0 w-full h-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          {...viewState}
          onMove={(evt) => {
            setViewState(evt.viewState);
            // Reportar centro SOLO cuando se está seleccionando destino
            if (isSelectingDestination && onCenterChange) {
              const { longitude, latitude } = evt.viewState;
              onCenterChange({ lat: latitude, lng: longitude });
            }
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {/* Marcador de ubicación actual */}
          {isValidCoordinate(currentUserLocation) && (
            <CustomMarker
              longitude={currentUserLocation[1]}
              latitude={currentUserLocation[0]}
              color="#10B981"
              title="Tu ubicación actual"
            />
          )}

          {/* Marcador de destino (usar la coordenada exacta seleccionada si existe) */}
          {isValidCoordinate(destinationLocation) ? (
            <CustomMarker
              longitude={destinationLocation[1]}
              latitude={destinationLocation[0]}
              color="#EF4444"
              title="Destino seleccionado"
              anchor="bottom"
            />
          ) : (
            routeCoordinates &&
            routeCoordinates.length > 1 &&
            isValidCoordinate([
              routeCoordinates[routeCoordinates.length - 1][0],
              routeCoordinates[routeCoordinates.length - 1][1],
            ]) && (
              <CustomMarker
                longitude={routeCoordinates[routeCoordinates.length - 1][1]}
                latitude={routeCoordinates[routeCoordinates.length - 1][0]}
                color="#EF4444"
                title="Destino seleccionado"
                anchor="bottom"
              />
            )
          )}

          {/* Marcador por defecto */}
          {!isValidCoordinate(currentUserLocation) && (
            <CustomMarker
              longitude={defaultLocation[1]}
              latitude={defaultLocation[0]}
              color="#6B7280"
              title="Boston, MA"
            />
          )}

          {/* Ruta */}
          {routeCoordinates && routeCoordinates.length > 1 && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: routeCoordinates.map((coord) => [
                    coord[1],
                    coord[0],
                  ]),
                },
              }}
            >
              <Layer
                id="route"
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
                paint={{
                  "line-color": "#3B82F6",
                  "line-width": 5,
                  "line-opacity": 0.8,
                }}
              />
            </Source>
          )}
        </Map>
      </div>

      {/* Pin central para selección de destino */}
      {isSelectingDestination && (
        <div className="absolute inset-0 pointer-events-none z-[1000]">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2">
            <div className="relative -translate-y-full">
              <div className="w-7 h-7 bg-red-500 rounded-full border-[3px] border-white shadow-lg mx-auto" />
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-red-500 mx-auto -mt-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Botón para obtener ubicación */}
      {!isSelectingDestination && (
        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className="absolute right-4 bottom-22 sm:bottom-28 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow z-30 disabled:opacity-50"
        >
          <svg
            className="w-5 h-5 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-[1000]">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-yellow-400 hover:text-yellow-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
