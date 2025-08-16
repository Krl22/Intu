import { useState } from "react";
import MapComponent from "./MapComponent";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  // Agregar estados para coordenadas
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  // Agregar estado para modo de selección
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'destination' | null>(null);

  const vehicles = [
    {
      id: 1,
      name: "Intu Express",
      time: "3 min",
      price: "S/ 8.50",
      capacity: "2 personas",
      icon: "🏍️",
      description: "Moto rápida y ágil"
    },
    {
      id: 2,
      name: "Intu Cargo",
      time: "5 min",
      price: "S/ 12.00",
      capacity: "4 personas + equipaje",
      icon: "🛺",
      description: "Mototaxi espacioso"
    },
    {
      id: 3,
      name: "Intu Premium",
      time: "7 min",
      price: "S/ 18.00",
      capacity: "3 personas",
      icon: "🚗",
      description: "Auto cómodo"
    },
    {
      id: 4,
      name: "Intu Pool",
      time: "12 min",
      price: "S/ 5.50",
      capacity: "Viaje compartido",
      icon: "👥",
      description: "Económico y ecológico"
    },
    {
      id: 5,
      name: "Intu Delivery",
      time: "4 min",
      price: "S/ 6.00",
      capacity: "Solo paquetes",
      icon: "📦",
      description: "Envíos rápidos"
    }
  ];

  const handleLocationSelect = (
    coordinates: [number, number],
    address: string
  ) => {
    if (selectionMode === 'pickup') {
      setPickup(address);
      setPickupCoords(coordinates);
      setSelectionMode(null);
    } else if (selectionMode === 'destination') {
      setDestination(address);
      setDestinationCoords(coordinates);
      setSelectionMode(null);
    }
    console.log("Ubicación seleccionada:", address, coordinates);
  };

  const clearLocations = () => {
    setPickup("");
    setDestination("");
    setPickupCoords(null);
    setDestinationCoords(null);
    setSelectionMode(null);
  };

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
              <h1 className="text-2xl font-bold text-white">
                Intu
              </h1>
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
            {/* Reemplazar el mapa simulado con el componente real */}
            <MapComponent
              pickupCoords={pickupCoords}
              destinationCoords={destinationCoords}
              selectionMode={selectionMode}
              onLocationSelect={handleLocationSelect}
            />

            {/* Formulario de búsqueda */}
            <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4 space-y-4">
              <div className="text-center mb-3">
                <p className="text-sm text-green-700 font-medium">🚗 Movilidad inteligente 🚗</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectionMode ? `Selecciona ${selectionMode === 'pickup' ? 'origen' : 'destino'} en el mapa` : 'Toca los campos o marca en el mapa'}
                </p>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="¿Desde dónde?"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    onFocus={() => setSelectionMode('pickup')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      selectionMode === 'pickup' ? 'border-green-500 bg-green-50' : 'border-green-200'
                    }`}
                  />
                  {pickupCoords && (
                    <button
                      onClick={() => {
                        setPickup("");
                        setPickupCoords(null);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="¿A dónde vas?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onFocus={() => setSelectionMode('destination')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      selectionMode === 'destination' ? 'border-amber-500 bg-amber-50' : 'border-green-200'
                    }`}
                  />
                  {destinationCoords && (
                    <button
                      onClick={() => {
                        setDestination("");
                        setDestinationCoords(null);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView("vehicles")}
                  disabled={!pickup || !destination}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                >
                  🔍 Buscar viaje
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
              <p className="text-sm text-green-600 italic font-medium">"Conectando destinos, un viaje a la vez" 💚</p>
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
                <p className="text-sm text-green-600">Tiempo estimado: 15 min</p>
              </div>
            </div>

            {/* Mapa pequeño */}
            <div className="bg-gradient-to-br from-green-100 to-amber-100 rounded-xl h-32 flex items-center justify-center mb-4 border border-green-200">
              <div className="text-center">
                <div className="text-2xl mb-1">🗺️</div>
                <p className="text-sm text-green-700 font-medium">Ruta calculada</p>
              </div>
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
                      <p className="font-bold text-green-700">{vehicle.price}</p>
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
