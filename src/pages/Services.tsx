import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/button';

interface VehicleType {
  id: string;
  name: string;
  description: string;
  price: string;
  estimatedTime: string;
  capacity: number;
  icon: string;
  features: string[];
}

const Services: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const vehicleTypes: VehicleType[] = [
    {
      id: 'moto_economy',
      name: 'IntuMoto Eco',
      description: 'Moto taxi económica y práctica',
      price: 'S/ 4–7',
      estimatedTime: '2–4 min',
      capacity: 2,
      icon: '🛺',
      features: ['Conductor verificado', 'Capota cubierta', 'Trayecto corto']
    },
    {
      id: 'moto_express',
      name: 'IntuMoto Express',
      description: 'Llegada rápida y directa',
      price: 'S/ 6–10',
      estimatedTime: '1–3 min',
      capacity: 2,
      icon: '🛵',
      features: ['Ruta optimizada', 'Prioridad de asignación', 'Casco disponible']
    },
    {
      id: 'moto_cargo',
      name: 'IntuMoto Cargo',
      description: 'Entrega de paquetes pequeños',
      price: 'S/ 8–15',
      estimatedTime: '3–5 min',
      capacity: 1,
      icon: '📦',
      features: ['Soporte trasero', 'Hasta 10 kg', 'Prueba de entrega']
    },
    {
      id: 'moto_premium',
      name: 'IntuMoto Premium',
      description: 'Mayor comodidad y seguridad',
      price: 'S/ 10–18',
      estimatedTime: '3–5 min',
      capacity: 2,
      icon: '🛺',
      features: ['Asiento acolchado', 'Capota reforzada', 'Conductor con alta calificación']
    }
  ];

  // Opciones destacadas solicitadas
  const specialOptions = [
    {
      id: 'food_delivery',
      name: 'Delivery de comida',
      description: 'Entrega de pedidos de restaurantes a tu ubicación',
      icon: '🍔',
      price: 'Desde S/ 8'
    },
    {
      id: 'pet_friendly',
      name: 'Taxi Pet-Friendly',
      description: 'Viaja con tu mascota (transportín o medidas de seguridad requeridas)',
      icon: '🐶',
      price: 'Recargo +S/ 2'
    },
    {
      id: 'moto_cargo_card',
      name: 'IntuMoto Cargo',
      description: 'Entrega de paquetes pequeños (hasta 10 kg)',
      icon: '📦',
      price: 'S/ 8–15'
    }
  ];

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
  };

  const handleBookRide = () => {
    if (selectedVehicle) {
      const vehicle = vehicleTypes.find(v => v.id === selectedVehicle);
      alert(`¡Perfecto! Has seleccionado ${vehicle?.name}. Redirigiendo a la pantalla de reserva...`);
    }
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Servicios</h1>
          <p className="text-gray-600">Elige tu tipo de servicio o opción especial</p>
        </div>

        {/* Opciones destacadas */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Opciones destacadas</h2>
          {specialOptions.map((opt) => (
            <Card
              key={opt.id}
              className={`p-4 ${opt.id === 'moto_cargo_card' ? 'cursor-pointer hover:shadow-md' : ''}`}
              onClick={() => {
                if (opt.id === 'moto_cargo_card') {
                  handleVehicleSelect('moto_cargo');
                }
              }}
              hover
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{opt.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{opt.name}</h3>
                  <p className="text-sm text-gray-600">{opt.description}</p>
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  {opt.price}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tipos de Moto Taxi */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Tipos de Moto Taxi</h2>
          {vehicleTypes.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedVehicle === vehicle.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleVehicleSelect(vehicle.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{vehicle.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{vehicle.name}</h3>
                      <p className="text-sm text-gray-600">{vehicle.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{vehicle.price}</div>
                      <div className="text-sm text-gray-500">{vehicle.estimatedTime}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span>👥 {vehicle.capacity} pasajeros</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Botón de reserva */}
        {selectedVehicle && (
          <div className="fixed bottom-20 left-4 right-4 z-10">
            <Card className="p-4">
              <Button
                onClick={handleBookRide}
                variant="default"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continuar con {vehicleTypes.find(v => v.id === selectedVehicle)?.name}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;