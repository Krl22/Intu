import React, { useState } from "react";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/button";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  rating: number;
  totalTrips: number;
}

const Account: React.FC = () => {
  const [user] = useState<UserProfile>({
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+52 55 1234 5678",
    avatar: "👩‍💼",
    memberSince: "Enero 2023",
    rating: 4.8,
    totalTrips: 47,
  });

  const menuItems = [
    {
      id: "profile",
      title: "Editar Perfil",
      description: "Actualiza tu información personal",
      icon: "👤",
      action: () => alert("Función de editar perfil próximamente"),
    },
    {
      id: "payment",
      title: "Métodos de Pago",
      description: "Gestiona tus tarjetas y métodos de pago",
      icon: "💳",
      action: () => alert("Función de métodos de pago próximamente"),
    },
    {
      id: "addresses",
      title: "Direcciones Guardadas",
      description: "Casa, trabajo y lugares frecuentes",
      icon: "📍",
      action: () => alert("Función de direcciones próximamente"),
    },
    {
      id: "notifications",
      title: "Notificaciones",
      description: "Configura tus preferencias de notificaciones",
      icon: "🔔",
      action: () => alert("Función de notificaciones próximamente"),
    },
    {
      id: "privacy",
      title: "Privacidad y Seguridad",
      description: "Controla tu privacidad y configuraciones de seguridad",
      icon: "🔒",
      action: () => alert("Función de privacidad próximamente"),
    },
    {
      id: "help",
      title: "Ayuda y Soporte",
      description: "Obtén ayuda o contacta con soporte",
      icon: "❓",
      action: () => alert("Función de ayuda próximamente"),
    },
  ];

  const quickActions = [
    {
      id: "emergency",
      title: "Contacto de Emergencia",
      icon: "🚨",
      action: () => alert("Función de emergencia próximamente"),
    },
    {
      id: "share",
      title: "Compartir App",
      icon: "📱",
      action: () => alert("Función de compartir próximamente"),
    },
    {
      id: "rate",
      title: "Calificar App",
      icon: "⭐",
      action: () => alert("Función de calificar próximamente"),
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
      >
        ⭐
      </span>
    ));
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu perfil y configuraciones</p>
        </div>

        {/* Perfil del usuario */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            {/* Avatar */}
            <div className="text-6xl">{user.avatar}</div>

            {/* Información básica */}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Miembro desde {user.memberSince}
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.totalTrips}
                </div>
                <div className="text-sm text-gray-600">Viajes realizados</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl font-bold text-yellow-600">
                    {user.rating}
                  </span>
                  {renderStars(user.rating)}
                </div>
                <div className="text-sm text-gray-600">Calificación</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Acciones rápidas */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="text-2xl mb-1">{action.icon}</div>
                <div className="text-xs text-gray-600 text-center">
                  {action.title}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Menú de configuraciones */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Configuraciones
          </h3>
          {menuItems.map((item) => (
            <Card key={item.id} className="p-4" hover onClick={item.action}>
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Información de la app */}
        <Card className="p-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-800">IntuTaxi</h3>
            <p className="text-sm text-gray-600">Versión 1.0.0</p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <button className="hover:text-blue-600">
                Términos de Servicio
              </button>
              <button className="hover:text-blue-600">
                Política de Privacidad
              </button>
            </div>
          </div>
        </Card>

        {/* Botón de cerrar sesión */}
        <Card className="p-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => alert("Función de cerrar sesión próximamente")}
          >
            Cerrar Sesión
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Account;
