/**
 * DNK Artisan 2.0 Auth Store
 * Persistent authentication state machine using Zustand and AsyncStorage.
 * Strictly operates against real JWT tokens returned by backend.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { APP_CONFIG } from '../constants/Config';
import { clearAuthToken, getAuthToken } from '../services/api';
import {
  ArtisanUser,
  fetchCurrentUser,
  logoutArtisan,
  sendOtp,
  verifyOtp,
} from '../services/authService';

interface AuthState {
  user: ArtisanUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  pendingIdentifier: string | null;
  otpSessionId: string | null;

  // Actions
  hydrateAuth: () => Promise<void>;
  requestOtp: (identifier: string) => Promise<boolean>;
  confirmOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: Partial<ArtisanUser>) => void;
  clearError: () => void;
  setPendingIdentifier: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  pendingIdentifier: null,
  otpSessionId: null,

  hydrateAuth: async () => {
    set({ isLoading: true, authError: null });
    try {
      const token = await getAuthToken();
      if (!token) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Load cached profile first for instant UI hydration
      const cachedProfile = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_PROFILE);
      let user: ArtisanUser | null = cachedProfile ? JSON.parse(cachedProfile) : null;

      // Verify token and fetch fresh profile from backend
      try {
        const liveUser = await fetchCurrentUser();
        if (liveUser) {
          user = liveUser;
        }
      } catch (profileErr) {
        // If profile fetch fails but token exists, retain cached profile
        console.warn('[AuthStore] Background profile refresh failed:', profileErr);
      }

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      console.warn('[AuthStore] Auth hydration failed:', err);
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  requestOtp: async (identifier: string) => {
    set({ isLoading: true, authError: null });
    try {
      const res = await sendOtp(identifier);
      set({
        isLoading: false,
        pendingIdentifier: identifier,
        otpSessionId: res.session_id || null,
      });
      return true;
    } catch (err: any) {
      const msg = err?.message || 'ओटीपी भेजने में त्रुटि हुई | Failed to send OTP';
      set({ isLoading: false, authError: msg });
      return false;
    }
  },

  confirmOtp: async (otp: string) => {
    const identifier = get().pendingIdentifier;
    if (!identifier) {
      set({ authError: 'मोबाइल नंबर उपलब्ध नहीं है | No phone number registered' });
      return false;
    }

    set({ isLoading: true, authError: null });
    try {
      const res = await verifyOtp(identifier, otp);
      let user = res.user || null;

      if (!user) {
        try {
          user = await fetchCurrentUser();
        } catch (_) {}
      }

      set({
        token: res.access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      return true;
    } catch (err: any) {
      const msg = err?.message || 'अमान्य ओटीपी कोड | Invalid OTP code. Please try again.';
      set({ isLoading: false, authError: msg });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutArtisan();
    } catch (err) {
      console.warn('[AuthStore] Logout error:', err);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        pendingIdentifier: null,
        otpSessionId: null,
      });
    }
  },

  setUser: (updates: Partial<ArtisanUser>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      set({ user: updated });
      void AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(updated)
      );
    }
  },

  clearError: () => set({ authError: null }),
  setPendingIdentifier: (pendingIdentifier: string | null) => set({ pendingIdentifier }),
}));

export default useAuthStore;
