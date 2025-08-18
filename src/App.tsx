import { useState, useCallback, useRef, useEffect } from "react";
import MapComponent from "./MapComponent";

// Interfaz para las sugerencias
interface AddressSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(
    null
  );
  const [destinationCoords, setDestinationCoords] = useState<
    [number, number] | null
  >(null);
  const [selectionMode, setSelectionMode] = useState<
    "pickup" | "destination" | null
  >(null);

  // Estados para autocompletado
  const [pickupSuggestions, setPickupSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para la ruta
  const [routeData, setRouteData] = useState<any>(null);
  // const [routeDistance, setRouteDistance] = useState<string>("");
  // const [routeDuration, setRouteDuration] = useState<string>("");
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Referencias para manejar clics fuera del dropdown
  const pickupRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  const vehicles = [
    {
      id: 1,
      name: "Intu Express",
      time: "3 min",
      price: "S/ 8.50",
      capacity: "2 personas",
      icon: "🏍️",
      description: "Moto rápida y ágil",
    },
    {
      id: 2,
      name: "Intu Cargo",
      time: "5 min",
      price: "S/ 12.00",
      capacity: "4 personas + equipaje",
      icon: "🛺",
      description: "Mototaxi espacioso",
    },
    {
      id: 3,
      name: "Intu Premium",
      time: "7 min",
      price: "S/ 18.00",
      capacity: "3 personas",
      icon: "🚗",
      description: "Auto cómodo",
    },
    {
      id: 4,
      name: "Intu Pool",
      time: "12 min",
      price: "S/ 5.50",
      capacity: "Viaje compartido",
      icon: "👥",
      description: "Económico y ecológico",
    },
    {
      id: 5,
      name: "Intu Delivery",
      time: "4 min",
      price: "S/ 6.00",
      capacity: "Solo paquetes",
      icon: "📦",
      description: "Envíos rápidos",
    },
  ];

  // Función para calcular la ruta
  const calculateRoute = async () => {
    if (!pickupCoords || !destinationCoords) {
      console.error("Coordenadas de origen y destino son requeridas");
      return;
    }

    setIsCalculatingRoute(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${
          pickupCoords[0]
        },${pickupCoords[1]};${destinationCoords[0]},${
          destinationCoords[1]
        }?geometries=geojson&access_token=${
          import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
        }`
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData(route);

        // Formatear distancia
        // const distanceKm = (route.distance / 1000).toFixed(1);
        // setRouteDistance(`${distanceKm} km`);

        // // Formatear duración
        // const durationMinutes = Math.round(route.duration / 60);
        // setRouteDuration(`${durationMinutes} min`);

        console.log("Ruta calculada:", route);
      } else {
        console.error("No se pudo calcular la ruta");
      }
    } catch (error) {
      console.error("Error calculando la ruta:", error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Función para limpiar la ruta
  const clearRoute = () => {
    setRouteData(null);
    // setRouteDistance("");
    // setRouteDuration("");
  };

  const handleLocationSelect = (
    coordinates: [number, number],
    address: string
  ) => {
    if (selectionMode === "pickup") {
      setPickup(address);
      setPickupCoords(coordinates);
      setSelectionMode(null);
    } else if (selectionMode === "destination") {
      setDestination(address);
      setDestinationCoords(coordinates);
      setSelectionMode(null);
    } else {
      // Si no hay modo de selección activo (ubicación automática)
      // Establecer como origen
      setPickup(address);
      setPickupCoords(coordinates);

      // Auto-activar selección de destino si no hay destino establecido
      if (!destination) {
        setTimeout(() => {
          setSelectionMode("destination");
        }, 1000); // Esperar 1 segundo para que el usuario vea que se estableció el origen
      }
    }
    console.log("Ubicación seleccionada:", address, coordinates);
  };

  const clearLocations = () => {
    setPickup("");
    setDestination("");
    setPickupCoords(null);
    setDestinationCoords(null);
    setSelectionMode(null);
    clearRoute(); // Limpiar también la ruta
  };

  // Función para buscar direcciones usando Mapbox Geocoding API
  const searchAddresses = useCallback(
    async (query: string, type: "pickup" | "destination") => {
      if (query.length < 3) {
        if (type === "pickup") {
          setPickupSuggestions([]);
          setShowPickupDropdown(false);
        } else {
          setDestinationSuggestions([]);
          setShowDestinationDropdown(false);
        }
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${
            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
          }&limit=5&country=PE&language=es`
        );
        const data = await response.json();

        const suggestions: AddressSuggestion[] = data.features.map(
          (feature: any) => ({
            id: feature.id,
            place_name: feature.place_name,
            center: feature.center,
          })
        );

        if (type === "pickup") {
          setPickupSuggestions(suggestions);
          setShowPickupDropdown(true);
        } else {
          setDestinationSuggestions(suggestions);
          setShowDestinationDropdown(true);
        }
      } catch (error) {
        console.error("Error buscando direcciones:", error);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Manejador para seleccionar una sugerencia
  const handleSuggestionSelect = (
    suggestion: AddressSuggestion,
    type: "pickup" | "destination"
  ) => {
    if (type === "pickup") {
      setPickup(suggestion.place_name);
      setPickupCoords(suggestion.center);
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
    } else {
      setDestination(suggestion.place_name);
      setDestinationCoords(suggestion.center);
      setDestinationSuggestions([]);
      setShowDestinationDropdown(false);
    }
    setSelectionMode(null);
  };

  // Manejador para cambios en los inputs
  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPickup(value);
    if (!value) {
      setPickupCoords(null);
    }
    searchAddresses(value, "pickup");
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    if (!value) {
      setDestinationCoords(null);
    }
    searchAddresses(value, "destination");
  };

  // Efecto para manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickupRef.current &&
        !pickupRef.current.contains(event.target as Node)
      ) {
        setShowPickupDropdown(false);
      }
      if (
        destinationRef.current &&
        !destinationRef.current.contains(event.target as Node)
      ) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/pwa-192x192.png"
              alt="Intu Logo"
              className="w-10 h-10 rounded-lg"
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white">Intu</h1>
              <p className="text-xs text-green-100 italic">intu corazón 💚</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-green-500 hover:bg-green-400 transition-colors">
              <span className="text-lg">🔔</span>
            </button>
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white text-sm font-semibold">C</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {currentView === "home" && (
          <div className="p-4 space-y-6">
            <MapComponent
              onLocationSelect={handleLocationSelect}
              pickupCoords={pickupCoords}
              destinationCoords={destinationCoords}
              selectionMode={selectionMode}
              routeData={routeData}
            />

            {/* Formulario de búsqueda con autocompletado */}
            <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4 space-y-4">
              <div className="text-center mb-3">
                <p className="text-sm text-green-700 font-medium">
                  🚗 Movilidad inteligente 🚗
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectionMode
                    ? `Selecciona ${
                        selectionMode === "pickup" ? "origen" : "destino"
                      } en el mapa`
                    : "Escribe o marca en el mapa"}
                </p>
              </div>

              <div className="space-y-3">
                {/* Campo de origen con autocompletado */}
                <div className="relative" ref={pickupRef}>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 z-10">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="¿Desde dónde?"
                    value={pickup}
                    onChange={handlePickupChange}
                    onFocus={() => {
                      setSelectionMode("pickup");
                      setShowPickupDropdown(true); // Mostrar siempre para incluir la opción del mapa
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      selectionMode === "pickup"
                        ? "border-green-500 bg-green-50"
                        : "border-green-200"
                    }`}
                  />
                  {pickupCoords && (
                    <button
                      onClick={() => {
                        setPickup("");
                        setPickupCoords(null);
                        setPickupSuggestions([]);
                        setShowPickupDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      ✕
                    </button>
                  )}

                  {/* Dropdown de sugerencias para origen */}
                  {showPickupDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-green-200 rounded-lg shadow-lg z-20 mt-1 max-h-60 overflow-y-auto">
                      {/* Opción para elegir en el mapa */}
                      <button
                        onClick={() => {
                          setSelectionMode("pickup");
                          setShowPickupDropdown(false);
                          setPickupSuggestions([]);
                        }}
                        className="w-full text-left p-3 hover:bg-green-50 border-b border-green-200 transition-colors bg-green-25"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-green-600 text-lg">🗺️</div>
                          <div>
                            <p className="text-sm font-medium text-green-700">
                              Elegir en el mapa
                            </p>
                            <p className="text-xs text-green-600">
                              Toca el mapa para seleccionar origen
                            </p>
                          </div>
                        </div>
                      </button>

                      {isSearching && (
                        <div className="p-3 text-center text-gray-500">
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></span>
                          Buscando...
                        </div>
                      )}
                      {pickupSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() =>
                            handleSuggestionSelect(suggestion, "pickup")
                          }
                          className="w-full text-left p-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {suggestion.place_name.split(",")[0]}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {suggestion.place_name}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mostrar dropdown incluso sin sugerencias para la opción del mapa */}
                  {showPickupDropdown &&
                    pickupSuggestions.length === 0 &&
                    !isSearching &&
                    pickup.length >= 1 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-green-200 rounded-lg shadow-lg z-20 mt-1">
                        <button
                          onClick={() => {
                            setSelectionMode("pickup");
                            setShowPickupDropdown(false);
                          }}
                          className="w-full text-left p-3 hover:bg-green-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-green-600 text-lg">🗺️</div>
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                Elegir en el mapa
                              </p>
                              <p className="text-xs text-green-600">
                                Toca el mapa para seleccionar origen
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                </div>

                {/* Campo de destino con autocompletado */}
                <div className="relative" ref={destinationRef}>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 z-10">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="¿A dónde vas?"
                    value={destination}
                    onChange={handleDestinationChange}
                    onFocus={() => {
                      setSelectionMode("destination");
                      if (destination.length >= 3)
                        setShowDestinationDropdown(true);
                      else setShowDestinationDropdown(true); // Mostrar siempre para la opción del mapa
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      selectionMode === "destination"
                        ? "border-amber-500 bg-amber-50"
                        : "border-green-200"
                    }`}
                  />
                  {destinationCoords && (
                    <button
                      onClick={() => {
                        setDestination("");
                        setDestinationCoords(null);
                        setDestinationSuggestions([]);
                        setShowDestinationDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      ✕
                    </button>
                  )}

                  {/* Dropdown de sugerencias para destino */}
                  {showDestinationDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-green-200 rounded-lg shadow-lg z-20 mt-1 max-h-60 overflow-y-auto">
                      {/* Opción para elegir en el mapa */}
                      <button
                        onClick={() => {
                          setSelectionMode("destination");
                          setShowDestinationDropdown(false);
                          setDestinationSuggestions([]);
                        }}
                        className="w-full text-left p-3 hover:bg-amber-50 border-b border-amber-200 transition-colors bg-amber-25"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-amber-600 text-lg">🗺️</div>
                          <div>
                            <p className="text-sm font-medium text-amber-700">
                              Elegir en el mapa
                            </p>
                            <p className="text-xs text-amber-600">
                              Toca el mapa para seleccionar destino
                            </p>
                          </div>
                        </div>
                      </button>

                      {isSearching && (
                        <div className="p-3 text-center text-gray-500">
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></span>
                          Buscando...
                        </div>
                      )}
                      {destinationSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() =>
                            handleSuggestionSelect(suggestion, "destination")
                          }
                          className="w-full text-left p-3 hover:bg-amber-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {suggestion.place_name.split(",")[0]}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {suggestion.place_name}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mostrar dropdown incluso sin sugerencias para la opción del mapa */}
                  {showDestinationDropdown &&
                    destinationSuggestions.length === 0 &&
                    !isSearching &&
                    destination.length >= 1 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-green-200 rounded-lg shadow-lg z-20 mt-1">
                        <button
                          onClick={() => {
                            setSelectionMode("destination");
                            setShowDestinationDropdown(false);
                          }}
                          className="w-full text-left p-3 hover:bg-amber-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-amber-600 text-lg">🗺️</div>
                            <div>
                              <p className="text-sm font-medium text-amber-700">
                                Elegir en el mapa
                              </p>
                              <p className="text-xs text-amber-600">
                                Toca el mapa para seleccionar destino
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    await calculateRoute();
                    setCurrentView("vehicles");
                  }}
                  disabled={!pickup || !destination || isCalculatingRoute}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                >
                  {isCalculatingRoute ? "🔄 Calculando..." : "🔍 Buscar viaje"}
                </button>
                {(pickupCoords || destinationCoords) && (
                  <button
                    onClick={clearLocations}
                    className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Limpiar ubicaciones"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-white rounded-xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                <div className="text-2xl mb-2">🏠</div>
                <p className="font-semibold text-gray-800">Casa</p>
                <p className="text-sm text-green-600">Mi ubicación</p>
              </button>

              <button className="bg-white rounded-xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                <div className="text-2xl mb-2">💼</div>
                <p className="font-semibold text-gray-800">Trabajo</p>
                <p className="text-sm text-green-600">Oficina</p>
              </button>
            </div>

            {/* Servicios adicionales */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                ⭐ Servicios disponibles
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button className="text-center p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="text-2xl mb-1">🍔</div>
                  <p className="text-xs text-green-700">Comida</p>
                </button>
                <button className="text-center p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-xs text-green-700">Paquetes</p>
                </button>
                <button className="text-center p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="text-2xl mb-1">🚲</div>
                  <p className="text-xs text-green-700">Bicicleta</p>
                </button>
              </div>
            </div>

            {/* Slogan adicional */}
            <div className="text-center py-4">
              <p className="text-sm text-green-600 italic font-medium">
                "Conectando destinos, un viaje a la vez" 💚
              </p>
            </div>
          </div>
        )}

        {currentView === "vehicles" && (
          <div className="p-4 space-y-4">
            {/* Header de selección */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 rounded-full hover:bg-green-100 transition-colors"
              >
                <span className="text-xl text-green-600">←</span>
              </button>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800 flex items-center">
                  🚗 Elige tu transporte
                </h2>
                <p className="text-sm text-green-600">
                  Tiempo estimado: 15 min
                </p>
              </div>
            </div>

            {/* Mapa pequeño */}
            <div className="rounded-xl h-48 mb-4 border border-green-200 overflow-hidden">
              <MapComponent
                pickupCoords={pickupCoords}
                destinationCoords={destinationCoords}
                routeData={routeData}
              />
            </div>

            {/* Lista de vehículos */}
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedVehicle === vehicle.id
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-green-200 bg-white hover:border-green-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{vehicle.icon}</div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-green-600">
                          {vehicle.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vehicle.capacity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">
                        {vehicle.price}
                      </p>
                      <p className="text-sm text-gray-600">{vehicle.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Botón de confirmación */}
            <button
              disabled={!selectedVehicle}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all shadow-md mt-6"
            >
              ✅ Confirmar viaje
            </button>

            {/* Métodos de pago */}
            <div className="bg-white rounded-xl border border-green-200 p-4 mt-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <p className="font-medium text-gray-800">Visa •••• 4532</p>
                    <p className="text-sm text-green-600">Método de pago</p>
                  </div>
                </div>
                <button className="text-green-600 text-sm font-medium hover:text-green-700">
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
