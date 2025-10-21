import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  memberSince: string;
  rating: number;
  totalTrips: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  id: string;
  userId: string;
  date: string;
  time: string;
  from: string;
  to: string;
  vehicleType: string;
  price: number;
  status: "completed" | "cancelled" | "in_progress";
  driver: string;
  rating?: number;
  duration: string;
  createdAt: Date;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            uid: user.uid,
            name: data.name || "Usuario",
            email: data.email || user.email || "",
            phone: data.phone || user.phoneNumber || "",
            avatar: data.avatar || "👤",
            memberSince:
              data.memberSince ||
              new Date().toLocaleDateString("es-PE", {
                month: "long",
                year: "numeric",
              }),
            rating: data.rating || 5.0,
            totalTrips: data.totalTrips || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          // Crear perfil por defecto si no existe
          const defaultProfile: Omit<UserProfile, "uid"> = {
            name: "Usuario",
            email: user.email || "",
            phone: user.phoneNumber || "",
            avatar: "👤",
            memberSince: new Date().toLocaleDateString("es-PE", {
              month: "long",
              year: "numeric",
            }),
            rating: 5.0,
            totalTrips: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await setDoc(docRef, defaultProfile);
          setProfile({ uid: user.uid, ...defaultProfile });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await updateDoc(docRef, updateData);
      setProfile((prev) => (prev ? { ...prev, ...updateData } : null));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error al actualizar el perfil");
    }
  };

  return { profile, loading, error, updateProfile };
};

export const useUserTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "trips"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tripsData: Trip[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tripsData.push({
            id: doc.id,
            userId: data.userId,
            date: data.date,
            time: data.time,
            from: data.from,
            to: data.to,
            vehicleType: data.vehicleType,
            price: data.price,
            status: data.status,
            driver: data.driver,
            rating: data.rating,
            duration: data.duration,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        setTrips(tripsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching trips:", err);
        setError("Error al cargar los viajes");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { trips, loading, error };
};
