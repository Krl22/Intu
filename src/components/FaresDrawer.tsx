import React, { useState, useRef, useEffect } from "react";
import Card from "./ui/Card";
import { Button } from "./ui/button";

interface FaresDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  destinationLabel?: string;
  // Métricas de la ruta para cálculo dinámico
  routeDistanceMeters?: number;
  routeDurationSeconds?: number;
  onConfirm: (vehicleType: string, estimatedPrice: number) => void;
  onVisibleHeightChange?: (height: number) => void;
}

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  description: string;
  estimatedTime: string;
  price: number; // precio base/fallback
  capacity: number;
}

const PEEK_HEIGHT = 48; // alto visible al colapsar (asa)
const NAV_HEIGHT = 64; // altura del bottom navbar en px
const COLLAPSE_GAP = 8; // separación para ver el asa

const FaresDrawer: React.FC<FaresDrawerProps> = ({
  isOpen,
  onClose,
  destinationLabel,
  routeDistanceMeters,
  routeDurationSeconds,
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

  // Definición de tarifas por tipo de vehículo
  const pricing = {
    moto_economy: { base: 3, includedKm: 2, perKm: 1.6, perMin: 0.12 },
    moto_express: { base: 4, includedKm: 2, perKm: 2.1, perMin: 0.16 },
    moto_cargo: { base: 5, includedKm: 2, perKm: 2.5, perMin: 0.22 },
    moto_premium: { base: 6, includedKm: 2, perKm: 3.0, perMin: 0.28 },
  } as const;

  const hasMetrics =
    typeof routeDistanceMeters === "number" && routeDistanceMeters > 0 &&
    typeof routeDurationSeconds === "number" && routeDurationSeconds > 0;

  const computePrice = (vehicle: VehicleType) => {
    if (!hasMetrics) return vehicle.price;
    const p = pricing[vehicle.id as keyof typeof pricing] || pricing.moto_economy;

    const km = routeDistanceMeters! / 1000;
    const minutes = routeDurationSeconds! / 60;

    // Tramo incluido
    const extraKm = Math.max(0, km - p.includedKm);
    let amount = p.base + extraKm * p.perKm + minutes * p.perMin;

    // Ajuste por tráfico: compara duración con la esperada a 35 km/h
    const baselineSpeedMps = 35000 / 3600; // 35 km/h
    const expectedSeconds = (routeDistanceMeters! / baselineSpeedMps) || 1;
    const trafficFactor = Math.max(1, routeDurationSeconds! / expectedSeconds);
    const trafficMultiplier = 1 + Math.min(0.5, (trafficFactor - 1) * 0.25); // hasta +50%
    amount *= trafficMultiplier;

    // Mínimo
    const minFare = Math.max(5, p.base);
    amount = Math.max(minFare, amount);

    // Redondeo
    return Math.round(amount * 100) / 100;
  };

  const vehicleTypes: VehicleType[] = [
    {
      id: "moto_economy",
      name: "IntuMoto Eco",
      icon: "🛺",
      description: "Moto taxi económica y práctica",
      estimatedTime: "2-4 min",
      price: 6,
      capacity: 2,
    },
    {
      id: "moto_express",
      name: "IntuMoto Express",
      icon: "🛵",
      description: "Llegada rápida y directa",
      estimatedTime: "1-3 min",
      price: 8,
      capacity: 2,
    },
    {
      id: "moto_cargo",
      name: "IntuMoto Cargo",
      icon: "📦",
      description: "Entrega de paquetes pequeños",
      estimatedTime: "3-5 min",
      price: 12,
      capacity: 1,
    },
    {
      id: "moto_premium",
      name: "IntuMoto Premium",
      icon: "🛺",
      description: "Mayor comodidad y seguridad",
      estimatedTime: "3-5 min",
      price: 16,
      capacity: 2,
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
            {hasMetrics && (
              <p className="text-xs text-gray-400 mt-1">
                Distancia aprox: {(routeDistanceMeters! / 1000).toFixed(1)} km · Tiempo: {Math.round(routeDurationSeconds! / 60)} min
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
            {vehicleTypes.map((vehicle) => {
              const displayPrice = computePrice(vehicle);
              return (
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
                            S/ {displayPrice}
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
              );
            })}
          </div>
        </div>

        {/* Confirmación */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={() => {
              if (!selectedVehicle) return;
              setIsLoading(true);
              const priceToConfirm = computePrice(selectedVehicle);
              setTimeout(() => {
                onConfirm(selectedVehicle.name, priceToConfirm);
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
              `Solicitar viaje - S/ ${computePrice(selectedVehicle)}`
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