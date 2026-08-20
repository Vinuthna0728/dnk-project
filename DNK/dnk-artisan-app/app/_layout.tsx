import React, { useEffect, useState } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { getAuthToken, fetchCurrentUser } from '../services/api';
import { useLanguageStore } from '../store/useLanguageStore';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const setProfileFromUser = useLanguageStore((state) => state.setProfileFromUser);

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      try {
        const token = await getAuthToken();

        const isLoginPage = pathname === '/' || pathname === '/index';

        // 1. User is NOT logged in and trying to access protected screen
        if (!token && !isLoginPage) {
          router.replace('/');
          return;
        }

        // 2. User IS logged in: load live profile from backend if not already loaded
        if (token) {
          try {
            const user = await fetchCurrentUser();
            if (isMounted && user) {
              setProfileFromUser(user);
            }
          } catch (_) {
            // Ignore background profile fetch failure
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (checkingAuth) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
