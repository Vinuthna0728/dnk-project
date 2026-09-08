/**
 * DNK Artisan 2.0 Authentication Service
 * Strictly interfaces with real backend authentication endpoints:
 * POST /api/v1/auth/otp/send
 * POST /api/v1/auth/otp/verify
 * GET /api/v1/auth/me
 *
 * Isolated Development / Demo mode is active ONLY when EXPO_PUBLIC_DEMO_MODE=true.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, APP_CONFIG, DEMO_CREDENTIALS, IS_DEMO_MODE } from '../constants/Config';
import { apiRequest, clearAuthToken, getAuthToken, setAuthToken } from './api';

export interface ArtisanUser {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  upi_id?: string;
  craft_type?: string;
  dnk_centre?: string;
  role: string;
  is_demo?: boolean;
  created_at?: string;
}

export interface OtpSendResponse {
  message: string;
  session_id?: string;
  success?: boolean;
}

export interface OtpVerifyResponse {
  access_token: string;
  token_type: string;
  user?: ArtisanUser;
}

/**
 * Send passwordless OTP to phone number or email.
 */
export async function sendOtp(identifier: string): Promise<OtpSendResponse> {
  const clean = identifier.trim();
  const isEmail = clean.includes('@');

  // Isolated development demo interception (Active ONLY when EXPO_PUBLIC_DEMO_MODE=true)
  if (IS_DEMO_MODE) {
    const isDemoPhone =
      clean === DEMO_CREDENTIALS.PHONE ||
      clean === DEMO_CREDENTIALS.ALTERNATIVE_PHONE;
    const isDemoEmail = clean.toLowerCase() === DEMO_CREDENTIALS.EMAIL.toLowerCase();

    if (isDemoPhone || isDemoEmail) {
      return {
        message: 'Development Demo OTP ready. Enter 123456 to verify.',
        session_id: 'demo_dev_session_id',
        success: true,
      };
    }
  }

  const payload: Record<string, string> = isEmail
    ? { email: clean }
    : { phone: clean };

  return await apiRequest<OtpSendResponse>(
    'POST',
    API_ENDPOINTS.AUTH_OTP_SEND,
    payload
  );
}

/**
 * Verify 6-digit OTP code against real backend and store real JWT.
 */
export async function verifyOtp(
  identifier: string,
  otp: string
): Promise<OtpVerifyResponse> {
  const clean = identifier.trim();
  const isEmail = clean.includes('@');
  const cleanOtp = otp.trim();

  // Isolated development demo interception (Active ONLY when EXPO_PUBLIC_DEMO_MODE=true)
  if (IS_DEMO_MODE) {
    const isDemoPhone =
      clean === DEMO_CREDENTIALS.PHONE ||
      clean === DEMO_CREDENTIALS.ALTERNATIVE_PHONE;
    const isDemoEmail = clean.toLowerCase() === DEMO_CREDENTIALS.EMAIL.toLowerCase();

    if (isDemoPhone || isDemoEmail) {
      if (cleanOtp === DEMO_CREDENTIALS.OTP) {
        const demoUser: ArtisanUser = {
          ...DEMO_CREDENTIALS.DEMO_USER,
          phone: isDemoPhone ? clean : DEMO_CREDENTIALS.PHONE,
          email: isDemoEmail ? clean : DEMO_CREDENTIALS.EMAIL,
        };

        await setAuthToken(DEMO_CREDENTIALS.DEMO_TOKEN);
        await AsyncStorage.setItem(
          APP_CONFIG.STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(demoUser)
        );

        return {
          access_token: DEMO_CREDENTIALS.DEMO_TOKEN,
          token_type: 'dev-session',
          user: demoUser,
        };
      } else {
        throw new Error('अमान्य ओटीपी कोड | Invalid demo OTP. Please enter 123456.');
      }
    }
  }

  const payload: Record<string, any> = {
    otp: cleanOtp,
    ...(isEmail ? { email: clean } : { phone: clean }),
  };

  const response = await apiRequest<OtpVerifyResponse>(
    'POST',
    API_ENDPOINTS.AUTH_OTP_VERIFY,
    payload
  );

  if (response.access_token) {
    await setAuthToken(response.access_token);
    if (response.user) {
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(response.user)
      );
    }
  }

  return response;
}

/**
 * Fetch authenticated artisan profile from backend.
 */
export async function fetchCurrentUser(): Promise<ArtisanUser> {
  const token = await getAuthToken();
  if (IS_DEMO_MODE && token === DEMO_CREDENTIALS.DEMO_TOKEN) {
    return DEMO_CREDENTIALS.DEMO_USER;
  }

  const user = await apiRequest<ArtisanUser>(
    'GET',
    API_ENDPOINTS.AUTH_ME
  );

  if (user) {
    await AsyncStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(user)
    );
  }

  return user;
}

/**
 * Logout artisan and purge stored session.
 */
export async function logoutArtisan(): Promise<void> {
  await clearAuthToken();
}

export default {
  sendOtp,
  verifyOtp,
  fetchCurrentUser,
  logoutArtisan,
};
