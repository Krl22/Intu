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
      id: 'economy',
      name: 'IntuEconomy',
      description: 'Opción económica y confiable',
      price: '$45-60',
      estimatedTime: '3-5 min',
      capacity: 4,
      icon: '🚗',
      features: ['Aire acondicionado', 'Música', 'Conductor verificado']
    },
    {
      id: 'comfort',
      name: 'IntuComfort',
      description: 'Vehículos más cómodos y espaciosos',
      price: '$65-85',
      estimatedTime: '4-7 min',
      capacity: 4,
      icon: '🚙',
      features: ['Asientos de cuero', 'WiFi', 'Agua gratis', 'Cargador USB']
    },
    {
      id: 'premium',
      name: 'IntuPremium',
      description: 'Experiencia de lujo',
      price: '$120-150',
      estimatedTime: '5-8 min',
      capacity: 4,
      icon: '🚘',
      features: ['Vehículo de lujo', 'Conductor profesional', 'Bebidas gratis', 'Periódicos']
    },
    {
      id: 'xl',
      name: 'IntuXL',
      description: 'Para grupos grandes o equipaje extra',
      price: '$80-100',
      estimatedTime: '6-10 min',
      capacity: 6,
      icon: '🚐',
      features: ['Espacio extra', 'Hasta 6 pasajeros', 'Equipaje grande', 'Aire acondicionado']
    }
  ];

  const additionalServices = [
    {
      id: 'scheduled',
      name: 'Viaje Programado',
      description: 'Programa tu viaje con anticipación',
      icon: '⏰',
      price: '+$10'
    },
    {
      id: 'airport',
      name: 'Servicio Aeropuerto',
      description: 'Especializado en traslados al aeropuerto',
      icon: '✈️',
      price: 'Tarifa fija'
    },
    {
      id: 'delivery',
      name: 'IntuDelivery',
      description: 'Envío de paquetes y documentos',
      icon: '📦',
      price: 'Desde $25'
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
          <p className="text-gray-600">Elige el tipo de vehículo que prefieras</p>
        </div>

        {/* Tipos de vehículos */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Tipos de Vehículo</h2>
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

        {/* Servicios adicionales */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Servicios Adicionales</h2>
          {additionalServices.map((service) => (
            <Card key={service.id} className="p-4" hover>
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{service.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  {service.price}
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