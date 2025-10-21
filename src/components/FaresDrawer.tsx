import React, { useState, useRef, useEffect } from "react";
import Card from "./ui/Card";
import { Button } from "./ui/button";

interface FaresDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  destinationLabel?: string;
  onConfirm: (vehicleType: string, estimatedPrice: number) => void;
  onVisibleHeightChange?: (height: number) => void;
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

const PEEK_HEIGHT = 48; // alto visible al colapsar (asa)
const NAV_HEIGHT = 64; // altura del bottom navbar en px
const COLLAPSE_GAP = 8; // separación para ver el asa

const FaresDrawer: React.FC<FaresDrawerProps> = ({
  isOpen,
  onClose,
  destinationLabel,
  onConfirm,
  onVisibleHeightChange,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const reportVisibleHeight = () => {
    if (!containerRef.current || !onVisibleHeightChange) return;
    const rect = containerRef.current.getBoundingClientRect();
    const visibleHeight = Math.max(
      0,
      Math.round(window.innerHeight - rect.top)
    );
    onVisibleHeightChange(visibleHeight);
  };

  useEffect(() => {
    if (!isOpen) return;
    // Reportar altura inicial y al cambiar colapso
    reportVisibleHeight();
    const onResize = () => reportVisibleHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, isCollapsed]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startYRef.current === null) return;
    e.preventDefault();
    const delta = e.clientY - startYRef.current;
    if (!isCollapsed) {
      setDragY(delta > 0 ? delta : 0);
    } else {
      setDragY(delta < 0 ? delta : 0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    if (!isCollapsed) {
      if (dragY > 120) setIsCollapsed(true);
    } else {
      if (dragY < -80) setIsCollapsed(false);
    }
    try {
      if (
        (e.currentTarget as any).hasPointerCapture &&
        (e.currentTarget as any).hasPointerCapture(e.pointerId)
      ) {
        (e.currentTarget as any).releasePointerCapture(e.pointerId);
      }
    } catch {}
    setDragY(0);
    // Reportar nueva altura visible después de ajustar el estado
    setTimeout(reportVisibleHeight, 0);
  };

  // Cálculo de transform según estado colapsado y arrastre
  const baseTransform = isCollapsed
    ? `translateY(calc(100% - ${PEEK_HEIGHT}px - ${
        NAV_HEIGHT + COLLAPSE_GAP
      }px))`
    : `translateY(0)`;
  const dragTransform = dragY ? ` translateY(${dragY}px)` : "";
  const transformStyle = `${baseTransform}${dragTransform}`;
  const transitionStyle = isDragging ? "none" : "transform 200ms ease";

  const vehicleTypes: VehicleType[] = [
    {
      id: "economy",
      name: "IntuEconomy",
      icon: "🚗",
      description: "Opción económica y confiable",
      estimatedTime: "3-5 min",
      price: 15.5,
      capacity: 4,
    },
    {
      id: "comfort",
      name: "IntuComfort",
      icon: "🚙",
      description: "Más espacio y comodidad",
      estimatedTime: "5-8 min",
      price: 22.0,
      capacity: 4,
    },
    {
      id: "premium",
      name: "IntuPremium",
      icon: "🚘",
      description: "Vehículos de lujo",
      estimatedTime: "8-12 min",
      price: 35.0,
      capacity: 4,
    },
    {
      id: "xl",
      name: "IntuXL",
      icon: "🚐",
      description: "Para grupos grandes",
      estimatedTime: "10-15 min",
      price: 28.0,
      capacity: 6,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-transparent pointer-events-none">
      <div
        ref={containerRef}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up pointer-events-auto"
        style={{
          transform: transformStyle,
          transition: transitionStyle,
          marginBottom: NAV_HEIGHT,
        }}
      >
        {/* Handle para arrastrar (colapsar/expandir) */}
        <div
          className="flex justify-center pt-3 pb-1 cursor-grab touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Tarifas disponibles
            </h2>
            {destinationLabel && (
              <p className="text-sm text-gray-500 mt-1">
                Destino: {destinationLabel}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Lista de vehículos */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {vehicleTypes.map((vehicle) => (
              <Card
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedVehicle?.id === vehicle.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="text-3xl mr-4">{vehicle.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">
                          {vehicle.name}
                        </h3>
                        <span className="text-lg font-bold text-gray-800">
                          ${vehicle.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {vehicle.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="mr-4">⏱️ {vehicle.estimatedTime}</span>
                        <span>👥 {vehicle.capacity} personas</span>
                      </div>
                    </div>
                  </div>
                  {selectedVehicle?.id === vehicle.id && (
                    <div className="ml-4 text-blue-600 font-semibold">
                      Seleccionado
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Confirmación */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={() => {
              if (!selectedVehicle) return;
              setIsLoading(true);
              setTimeout(() => {
                onConfirm(selectedVehicle.name, selectedVehicle.price);
                setIsLoading(false);
                onClose();
              }, 800);
            }}
            disabled={!selectedVehicle || isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              selectedVehicle && !isLoading
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Solicitando...
              </div>
            ) : selectedVehicle ? (
              `Solicitar viaje - $${selectedVehicle.price}`
            ) : (
              "Selecciona un vehículo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FaresDrawer;