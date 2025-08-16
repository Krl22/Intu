import { useState } from "react";
import MapComponent from "./MapComponent";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  // const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(
  //   null
  // );
  // const [destinationCoords, setDestinationCoords] = useState<
  //   [number, number] | null
  // >(null);

  const vehicles = [
    {
      id: 1,
      name: "UberX",
      time: "3 min",
      price: "$12.50",
      capacity: "4 personas",
      icon: "🚗",
    },
    {
      id: 2,
      name: "UberXL",
      time: "5 min",
      price: "$18.75",
      capacity: "6 personas",
      icon: "🚙",
    },
    {
      id: 3,
      name: "Uber Black",
      time: "8 min",
      price: "$25.00",
      capacity: "4 personas",
      icon: "🖤",
    },
    {
      id: 4,
      name: "Uber Pool",
      time: "12 min",
      price: "$8.25",
      capacity: "Compartido",
      icon: "👥",
    },
  ];

  const handleLocationSelect = (
    coordinates: [number, number],
    address: string
  ) => {
    // Lógica para manejar selección de ubicación
    console.log("Ubicación seleccionada:", address, coordinates);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">IntuRide</h1>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-gray-100">
              <span className="text-lg">🔔</span>
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
              // pickup={pickup}
              // destination={destination}
              onLocationSelect={handleLocationSelect}
            />

            {/* Formulario de búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="¿A dónde vas?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setCurrentView("vehicles")}
                disabled={!pickup || !destination}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Buscar viaje
              </button>
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🏠</div>
                <p className="font-semibold text-gray-800">Casa</p>
                <p className="text-sm text-gray-600">Av. Libertador 456</p>
              </button>

              <button className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">💼</div>
                <p className="font-semibold text-gray-800">Trabajo</p>
                <p className="text-sm text-gray-600">Centro Empresarial</p>
              </button>
            </div>

            {/* Servicios adicionales */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Otros servicios
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button className="text-center p-3 rounded-lg hover:bg-gray-50">
                  <div className="text-2xl mb-1">🍔</div>
                  <p className="text-xs text-gray-600">Comida</p>
                </button>
                <button className="text-center p-3 rounded-lg hover:bg-gray-50">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-xs text-gray-600">Paquetes</p>
                </button>
                <button className="text-center p-3 rounded-lg hover:bg-gray-50">
                  <div className="text-2xl mb-1">🚲</div>
                  <p className="text-xs text-gray-600">Bicicleta</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === "vehicles" && (
          <div className="p-4 space-y-4">
            {/* Header de selección */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <span className="text-xl">←</span>
              </button>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">Elige tu viaje</h2>
                <p className="text-sm text-gray-600">Tiempo estimado: 15 min</p>
              </div>
            </div>

            {/* Mapa pequeño */}
            <div className="bg-blue-100 rounded-xl h-32 flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🗺️</div>
                <p className="text-sm text-gray-700">Ruta calculada</p>
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
                      ? "border-black bg-gray-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{vehicle.icon}</div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {vehicle.capacity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{vehicle.price}</p>
                      <p className="text-sm text-gray-600">{vehicle.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Botón de confirmación */}
            <button
              disabled={!selectedVehicle}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors mt-6"
            >
              Confirmar viaje
            </button>

            {/* Métodos de pago */}
            <div className="bg-white rounded-xl border p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <p className="font-medium text-gray-800">Visa •••• 4532</p>
                    <p className="text-sm text-gray-600">Método de pago</p>
                  </div>
                </div>
                <button className="text-blue-500 text-sm font-medium">
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
