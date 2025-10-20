import React, { useState } from 'react';
import Card from './ui/Card';
import { Button } from './ui/button';

interface RideRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  onConfirm: (vehicleType: string, estimatedPrice: number) => void;
}

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  description: string;
  estimatedTime: string;
  price: number;
  capacity: number;
}

const RideRequestModal: React.FC<RideRequestModalProps> = ({
  isOpen,
  onClose,
  destination,
  onConfirm,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const vehicleTypes: VehicleType[] = [
    {
      id: 'economy',
      name: 'IntuEconomy',
      icon: '🚗',
      description: 'Opción económica y confiable',
      estimatedTime: '3-5 min',
      price: 15.50,
      capacity: 4,
    },
    {
      id: 'comfort',
      name: 'IntuComfort',
      icon: '🚙',
      description: 'Más espacio y comodidad',
      estimatedTime: '5-8 min',
      price: 22.00,
      capacity: 4,
    },
    {
      id: 'premium',
      name: 'IntuPremium',
      icon: '🚘',
      description: 'Vehículos de lujo',
      estimatedTime: '8-12 min',
      price: 35.00,
      capacity: 4,
    },
    {
      id: 'xl',
      name: 'IntuXL',
      icon: '🚐',
      description: 'Para grupos grandes',
      estimatedTime: '10-15 min',
      price: 28.00,
      capacity: 6,
    },
  ];

  const handleConfirm = async () => {
    if (!selectedVehicle) return;
    
    setIsLoading(true);
    
    // Simulamos una llamada a la API
    setTimeout(() => {
      onConfirm(selectedVehicle.name, selectedVehicle.price);
      setIsLoading(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Solicitar Viaje</h2>
            <p className="text-sm text-gray-500 mt-1">Selecciona tu vehículo</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Destination */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Destino</p>
              <p className="font-medium text-gray-800">{destination.split(' - ')[1]}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {vehicleTypes.map((vehicle) => (
              <Card
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="text-3xl mr-4">{vehicle.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{vehicle.name}</h3>
                        <span className="text-lg font-bold text-gray-800">${vehicle.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{vehicle.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="mr-4">⏱️ {vehicle.estimatedTime}</span>
                        <span>👥 {vehicle.capacity} personas</span>
                      </div>
                    </div>
                  </div>
                  {selectedVehicle?.id === vehicle.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={handleConfirm}
            disabled={!selectedVehicle || isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              selectedVehicle && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Confirmando...
              </div>
            ) : selectedVehicle ? (
              `Confirmar viaje - $${selectedVehicle.price}`
            ) : (
              'Selecciona un vehículo'
            )}
          </Button>
          
          {selectedVehicle && (
            <p className="text-center text-xs text-gray-500 mt-3">
              Tiempo estimado de llegada: {selectedVehicle.estimatedTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideRequestModal;