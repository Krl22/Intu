import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/button';

interface Trip {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  vehicleType: string;
  price: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  driver: string;
  rating?: number;
  duration: string;
}

const Activity: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const trips: Trip[] = [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      from: 'Casa',
      to: 'Aeropuerto Internacional',
      vehicleType: 'IntuComfort',
      price: 75,
      status: 'completed',
      driver: 'Carlos Mendoza',
      rating: 5,
      duration: '45 min'
    },
    {
      id: '2',
      date: '2024-01-14',
      time: '09:15',
      from: 'Hotel Marriott',
      to: 'Centro Histórico',
      vehicleType: 'IntuEconomy',
      price: 45,
      status: 'completed',
      driver: 'Ana García',
      rating: 4,
      duration: '25 min'
    },
    {
      id: '3',
      date: '2024-01-13',
      time: '18:45',
      from: 'Oficina',
      to: 'Polanco',
      vehicleType: 'IntuPremium',
      price: 120,
      status: 'cancelled',
      driver: 'Miguel Torres',
      duration: '30 min'
    },
    {
      id: '4',
      date: '2024-01-12',
      time: '12:00',
      from: 'Roma Norte',
      to: 'Condesa',
      vehicleType: 'IntuEconomy',
      price: 35,
      status: 'completed',
      driver: 'Laura Jiménez',
      rating: 5,
      duration: '15 min'
    },
    {
      id: '5',
      date: '2024-01-11',
      time: '20:30',
      from: 'Restaurante',
      to: 'Casa',
      vehicleType: 'IntuXL',
      price: 85,
      status: 'completed',
      driver: 'Roberto Silva',
      rating: 4,
      duration: '35 min'
    }
  ];

  const filteredTrips = trips.filter(trip => {
    if (selectedFilter === 'all') return true;
    return trip.status === selectedFilter;
  });

  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const totalSpent = trips
    .filter(t => t.status === 'completed')
    .reduce((sum, trip) => sum + trip.price, 0);
  const averageRating = trips
    .filter(t => t.rating)
    .reduce((sum, trip) => sum + (trip.rating || 0), 0) / trips.filter(t => t.rating).length;

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: Trip['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'in_progress':
        return 'En progreso';
      default:
        return 'Desconocido';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Actividad</h1>
          <p className="text-gray-600">Tu historial de viajes y estadísticas</p>
        </div>

        {/* Estadísticas */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Resumen</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTrips}</div>
              <div className="text-sm text-gray-600">Viajes totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTrips}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${totalSpent}</div>
              <div className="text-sm text-gray-600">Total gastado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Calificación promedio</div>
            </div>
          </div>
        </Card>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex space-x-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className="flex-1"
            >
              Todos
            </Button>
            <Button
              variant={selectedFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('completed')}
              className="flex-1"
            >
              Completados
            </Button>
            <Button
              variant={selectedFilter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('cancelled')}
              className="flex-1"
            >
              Cancelados
            </Button>
          </div>
        </Card>

        {/* Lista de viajes */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Historial de Viajes ({filteredTrips.length})
          </h2>
          
          {filteredTrips.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="text-gray-500">
                <div className="text-4xl mb-2">🚗</div>
                <div>No hay viajes para mostrar</div>
              </div>
            </Card>
          ) : (
            filteredTrips.map((trip) => (
              <Card key={trip.id} className="p-4" hover>
                <div className="space-y-3">
                  {/* Header del viaje */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {trip.from} → {trip.to}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trip.date} • {trip.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">${trip.price}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                        {getStatusText(trip.status)}
                      </span>
                    </div>
                  </div>

                  {/* Detalles del viaje */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>🚗 {trip.vehicleType}</span>
                      <span>⏱️ {trip.duration}</span>
                    </div>
                    {trip.rating && (
                      <div className="flex items-center space-x-1">
                        {renderStars(trip.rating)}
                      </div>
                    )}
                  </div>

                  {/* Conductor */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>👤</span>
                    <span>Conductor: {trip.driver}</span>
                  </div>

                  {/* Acciones */}
                  {trip.status === 'completed' && (
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Repetir viaje
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver recibo
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;