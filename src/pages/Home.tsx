import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import SearchInput from '../components/ui/SearchInput';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/button';
import FaresDrawer from '../components/FaresDrawer';
import RideRequestModal from '../components/RideRequestModal';

const Home: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showRideModal, setShowRideModal] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [showFaresDrawer, setShowFaresDrawer] = useState(false);
  const [drawerDestinationLabel, setDrawerDestinationLabel] = useState<string>('');
  const [fitRoutePadding, setFitRoutePadding] = useState<{ top?: number; right?: number; bottom?: number; left?: number }>({ top: 24, right: 24, bottom: 0, left: 24 });
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [searchPhaseIndex, setSearchPhaseIndex] = useState(0);
  const [searchVehicle, setSearchVehicle] = useState<{ name: string; price: number } | null>(null);
  const searchPhases = [
    'Buscando conductores cercanos…',
    'Conectando con la red Intu…',
    'Esperando confirmación del conductor…',
    'Buscando alternativas de ruta…',
  ];

  // Verificar si es la primera visita a Home
  useEffect(() => {
    const hasVisitedHome = localStorage.getItem('hasVisitedHome');
    if (!hasVisitedHome) {
      setShowQuickAccess(true);
      localStorage.setItem('hasVisitedHome', 'true');
    }
  }, []);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Ubicación por defecto (Boston)
          setUserLocation([42.3601, -71.0589]);
        }
      );
    } else {
      // Ubicación por defecto si no hay geolocalización
      setUserLocation([42.3601, -71.0589]);
    }
  }, []);

  useEffect(() => {
    if (!showFaresDrawer) {
      // Cuando el drawer no está visible, mostrar la ruta a pantalla completa
      setFitRoutePadding((p) => ({ ...p, bottom: 0 }));
    }
  }, [showFaresDrawer]);

  // Cleanup del timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length > 2) {
      // Debounce de 300ms para evitar demasiadas llamadas a la API
      const timeout = setTimeout(async () => {
        try {
          // Usar la ubicación del usuario para hacer búsquedas más relevantes
          const lat = userLocation ? userLocation[0] : 42.3601; // Boston por defecto
          const lon = userLocation ? userLocation[1] : -71.0589; // Boston por defecto
          
          // API de Nominatim para geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1&viewbox=${lon-0.1},${lat+0.1},${lon+0.1},${lat-0.1}&bounded=1&countrycodes=us`
          );
          
          if (response.ok) {
            const data = await response.json();
            const newSuggestions = data.map((item: any) => {
              const address = item.display_name;
              return address;
            });
            setSuggestions(newSuggestions);
          } else {
            // Fallback a búsqueda sin restricciones geográficas
            const fallbackResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`
            );
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              const newSuggestions = data.map((item: any) => item.display_name);
              setSuggestions(newSuggestions);
            }
          }
        } catch (error) {
          console.error('Error en la búsqueda de ubicaciones:', error);
          // Fallback a sugerencias genéricas si falla la API
          setSuggestions([
            `${value} - Buscar en el mapa`,
            `${value} - Dirección aproximada`,
          ]);
        }
      }, 300);
      
      setSearchTimeout(timeout);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectDestination = (destination: string) => {
    setSelectedDestination(destination);
    setSearchValue('');
    setSuggestions([]);
    setIsSearchFocused(false);
    // Limpiar ruta anterior cuando se selecciona de sugerencias
    setRouteCoordinates(null);
  };

  const handleRequestRide = () => {
    if (selectedDestination) {
      setShowRideModal(true);
    } else {
      alert('Por favor selecciona un destino');
    }
  };

  const handleConfirmRide = (vehicleType: string, estimatedPrice: number) => {
    const destino = selectedDestination || drawerDestinationLabel || 'Destino no especificado';
    alert(`¡Viaje confirmado!\nDestino: ${destino}\nVehículo: ${vehicleType}\nPrecio: $${estimatedPrice}\n\nTu conductor llegará pronto.`);
    // Aquí se implementaría la lógica real de solicitud de viaje
    setSelectedDestination(null);
    setSearchValue('');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (isSelectingDestination) {
      // Si ya está en modo de selección de pin, cancelar
      setIsSelectingDestination(false);
    } else if (!selectedDestination) {
      // Si no hay destino seleccionado, activar modo de selección de pin
      setIsSelectingDestination(true);
      // Limpiar ruta anterior
      setRouteCoordinates(null);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  const handleMapCenterChange = (center: {lat: number, lng: number}) => {
    setMapCenter(center);
  };

  const handleConfirmMapSelection = async () => {
    if (mapCenter && userLocation) {
      const destinationText = `Lat: ${mapCenter.lat.toFixed(4)}, Lng: ${mapCenter.lng.toFixed(4)}`;
      setDrawerDestinationLabel(destinationText);
      setIsSelectingDestination(false);
      setIsSearchFocused(false);
      await calculateRoute(userLocation, [mapCenter.lat, mapCenter.lng]);
      setShowFaresDrawer(true);
    }
  };

  const handleDrawerVisibleHeight = (height: number) => {
    setFitRoutePadding({ top: 24, right: 24, bottom: height, left: 24 });
  };

  const handleQuickAccessSelect = (destination: string) => {
    handleSelectDestination(destination);
    setShowQuickAccess(false); // Ocultar accesos rápidos después de seleccionar uno
  };

  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    try {
      // Usando una API de routing simple (OpenRouteService alternativa gratuita)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRouteCoordinates(coordinates);
        }
      } else {
        console.error('Error calculando ruta');
        // Fallback: línea recta
        setRouteCoordinates([start, end]);
      }
    } catch (error) {
      console.error('Error en la API de routing:', error);
      // Fallback: línea recta
      setRouteCoordinates([start, end]);
    }
  };

  const quickAccessPlaces = [
    { icon: '🏠', label: 'Casa', address: 'Av. Principal 123' },
    { icon: '💼', label: 'Trabajo', address: 'Centro Empresarial' },
    { icon: '🏥', label: 'Hospital', address: 'Hospital Central' },
    { icon: '🛒', label: 'Centro Comercial', address: 'Plaza Shopping' },
  ];

  // Fases de búsqueda de conductor simuladas
  useEffect(() => {
    if (!isSearchingDriver) return;
    setSearchPhaseIndex(0);
    const phasesCount = searchPhases.length;
    const interval = setInterval(() => {
      setSearchPhaseIndex((i) => (i + 1) % phasesCount);
    }, 3000);
    return () => clearInterval(interval);
  }, [isSearchingDriver]);

  const handleCancelSearch = () => {
    setIsSearchingDriver(false);
    setSearchVehicle(null);
    setShowFaresDrawer(true);
    // Al cancelar, volvemos a mostrar la ruta a pantalla completa
    setFitRoutePadding({ top: 24, right: 24, bottom: 0, left: 24 });
  };

  return (
    <div className="relative h-screen bg-gray-50">
      {/* Mapa de fondo */}
      <div className="absolute inset-0">
        <MapComponent 
          isSelectingDestination={isSelectingDestination}
          onCenterChange={handleMapCenterChange}
          routeCoordinates={routeCoordinates}
          userLocation={userLocation}
          fitRoutePadding={fitRoutePadding}
        />
      </div>
      
      {/* Overlay con controles */}
      {!showFaresDrawer && !isSearchingDriver && (
        <div className="absolute top-0 left-0 right-0 z-10 safe-area-top">
        <div className="container mx-auto p-4">
          <div className={`bg-white rounded-2xl shadow-lg transition-all duration-300 ${
            isSearchFocused || suggestions.length > 0 ? 'shadow-2xl' : ''
          }`}>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">¿A dónde vamos?</h1>
                  <p className="text-sm text-gray-500">Encuentra tu destino</p>
                </div>
              </div>
              
              <SearchInput
                placeholder="Buscar destino, dirección o lugar..."
                value={searchValue}
                onChange={handleSearch}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="mb-4"
              />
              
              {suggestions.length > 0 && (
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      onClick={() => handleSelectDestination(suggestion)}
                      className="p-3 cursor-pointer hover:bg-blue-50 transition-all duration-200 border-l-4 border-transparent hover:border-blue-500"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium">{suggestion.split(' - ')[1]}</span>
                          <p className="text-xs text-gray-500">{suggestion.split(' - ')[0]}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {selectedDestination && (
                <div className="mb-4 fade-in">
                  <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-blue-800 font-semibold">{selectedDestination.split(' - ')[1]}</span>
                          <p className="text-xs text-blue-600">{selectedDestination.split(' - ')[0]}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDestination(null);
                          setSearchValue('');
                        }}
                        className="w-8 h-8 bg-blue-200 hover:bg-blue-300 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </Card>
                </div>
              )}
              
              <Button
                onClick={isSelectingDestination ? handleConfirmMapSelection : handleRequestRide}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  selectedDestination || isSelectingDestination
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!selectedDestination && !isSelectingDestination}
              >
                {isSelectingDestination 
                  ? 'Confirmar ubicación' 
                  : selectedDestination 
                    ? 'Solicitar Viaje' 
                    : 'Selecciona un destino'
                }
              </Button>
            </div>
          </div>
        </div>
        {/* Accesos rápidos */}
        {!isSearchFocused && suggestions.length === 0 && !isSelectingDestination && showQuickAccess && (
          <div className="container mx-auto px-4 mt-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 fade-in">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Accesos rápidos</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickAccessPlaces.map((place, index) => (
                  <Card
                    key={index}
                    onClick={() => handleQuickAccessSelect(`${place.address} - ${place.label}`)}
                    className="p-4 text-center cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-2xl mb-2">{place.icon}</div>
                    <span className="text-sm font-medium text-gray-700 block">{place.label}</span>
                    <span className="text-xs text-gray-500">{place.address}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
         )}


       </div>

       )}

       {/* Overlay de búsqueda de conductor */}
       {isSearchingDriver && (
         <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
           <div className="w-full max-w-md pointer-events-auto mb-16">
             <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
               <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-gray-800">Buscando conductor</h2>
                 {searchVehicle && (
                   <span className="text-sm text-gray-500">{searchVehicle.name}</span>
                 )}
               </div>
               <div className="mt-4 flex items-center">
                 <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                 <p className="text-sm text-gray-700">{searchPhases[searchPhaseIndex]}</p>
               </div>
               {searchVehicle && (
                 <p className="mt-2 text-xs text-gray-500">Tarifa estimada: ${searchVehicle.price}</p>
               )}
               <Button
                 onClick={handleCancelSearch}
                 className="w-full mt-4 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-xl py-3"
               >
                 Cancelar búsqueda
               </Button>
             </div>
           </div>
         </div>
       )}

       {/* Drawer de tarifas */}
       <FaresDrawer
         isOpen={showFaresDrawer}
         onClose={() => {
           setShowFaresDrawer(false);
           setFitRoutePadding({ top: 24, right: 24, bottom: 0, left: 24 });
         }}
         destinationLabel={drawerDestinationLabel}
         onConfirm={(vehicleType, estimatedPrice) => {
           // Inicia simulación de búsqueda de conductor
           setSearchVehicle({ name: vehicleType, price: estimatedPrice });
           setShowFaresDrawer(false);
           setIsSearchingDriver(true);
           setFitRoutePadding({ top: 24, right: 24, bottom: 0, left: 24 });
         }}
         onVisibleHeightChange={handleDrawerVisibleHeight}
       />

       {/* Modal de solicitud de viaje (para otros flujos) */}
       <RideRequestModal
         isOpen={showRideModal}
         onClose={() => setShowRideModal(false)}
         destination={selectedDestination || ''}
         onConfirm={handleConfirmRide}
       />
     </div>
   );
};
 
export default Home;