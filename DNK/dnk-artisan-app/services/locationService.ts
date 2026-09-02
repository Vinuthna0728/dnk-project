/**
 * DNK Artisan 2.0 Location Service
 * Uses expo-location for real device GPS detection
 * and queries the real backend for the 5 nearest DNK post offices.
 */

import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { API_ENDPOINTS } from '../constants/Config';
import { apiRequest } from './api';

export interface DnkCenter {
  id: string | number;
  name: string;
  pincode: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  contact_number?: string;
  operating_hours?: string;
  is_customs_equipped?: boolean;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Request GPS permissions and obtain current coordinates.
 */
export async function getCurrentCoordinates(): Promise<GpsCoordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('जीपीएस अनुमति अस्वीकृत | Location permission was denied. Please enable GPS in settings.');
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

/**
 * Fetch 5 nearest DNK centers from real backend.
 * Tries GET /api/v1/logistics/nearest-dnk then GET /api/v1/dnk/nearby.
 */
export async function fetchNearestDnkCenters(
  lat: number,
  lng: number
): Promise<DnkCenter[]> {
  try {
    const res = await apiRequest<DnkCenter[]>(
      'GET',
      `${API_ENDPOINTS.NEAREST_DNK}?lat=${lat}&lng=${lng}&limit=5`
    );
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (_) {
    // Try secondary nearby endpoint
    try {
      const res2 = await apiRequest<DnkCenter[]>(
        'GET',
        `${API_ENDPOINTS.DNK_NEARBY}?lat=${lat}&lng=${lng}&limit=5`
      );
      if (Array.isArray(res2) && res2.length > 0) return res2;
    } catch (e: any) {
      throw new Error('डाकघर केंद्र सूची उपलब्ध नहीं हो पाई | Unable to load nearest DNK centers from server.');
    }
  }

  return [];
}

/**
 * Open external Google Maps navigation to the DNK post office.
 */
export function openMapsNavigation(lat: number, lng: number, label?: string): void {
  const scheme = Platform.select({
    ios: `maps:0,0?q=${label || 'DNK Post Office'}@${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(${label || 'DNK Post Office'})`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  });

  void Linking.openURL(scheme as string);
}

export default {
  getCurrentCoordinates,
  fetchNearestDnkCenters,
  openMapsNavigation,
};
