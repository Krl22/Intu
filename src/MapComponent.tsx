import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Configurar el token de acceso
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapComponentProps {
  onLocationSelect?: (coordinates: [number, number], address: string) => void;
  // Eliminar pickup y destination ya que no se usan
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  // Eliminar pickup y destination de los parámetros
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(-74.5); // Eliminar setLng
  const [lat] = useState(40); // Eliminar setLat
  const [zoom] = useState(9); // Eliminar setZoom

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
  }, [lng, lat, zoom]);

  // Eliminar o comentar la función showRoute si no se usa
  // const showRoute = async (start: [number, number], end: [number, number]) => {
  //   if (!map.current) return;
  //
  //   try {
  //     const response = await fetch(
  //       `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
  //     );
  //     const data = await response.json();
  //     const route = data.routes[0];
  //
  //     // Agregar la ruta al mapa
  //     if (map.current.getSource("route")) {
  //       map.current.removeLayer("route");
  //       map.current.removeSource("route");
  //     }
  //
  //     map.current.addSource("route", {
  //       type: "geojson",
  //       data: {
  //         type: "Feature",
  //         properties: {},
  //         geometry: route.geometry,
  //       },
  //     });
  //
  //     map.current.addLayer({
  //       id: "route",
  //       type: "line",
  //       source: "route",
  //       layout: {
  //         "line-join": "round",
  //         "line-cap": "round",
  //       },
  //       paint: {
  //         "line-color": "#3887be",
  //         "line-width": 5,
  //         "line-opacity": 0.75,
  //       },
  //     });
  //
  //     // Ajustar la vista para mostrar toda la ruta
  //     const coordinates = route.geometry.coordinates;
  //     const bounds = coordinates.reduce(
  //       (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
  //         return bounds.extend(coord);
  //       },
  //       new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
  //     );
  //
  //     map.current.fitBounds(bounds, {
  //       padding: 20,
  //     });
  //   } catch (error) {
  //     console.error("Error obteniendo ruta:", error);
  //   }
  // };

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-64 rounded-xl" />
      <div className="absolute top-2 left-2 bg-white p-2 rounded shadow text-xs">
        Lng: {lng.toFixed(4)} | Lat: {lat.toFixed(4)} | Zoom: {zoom.toFixed(2)}
      </div>
    </div>
  );
};

export default MapComponent;
