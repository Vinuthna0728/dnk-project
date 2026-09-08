/**
 * Root Application Layout
 * Universal Auth & Language provider with route protection.
 */

import React, { useEffect, useState } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrateAuth, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const { hydrateLanguage } = useLanguageStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      await Promise.all([hydrateAuth(), hydrateLanguage()]);
      if (mounted) {
        setIsReady(true);
      }
    };
    void initialize();
    return () => {
      mounted = false;
    };
  }, []);

  // Route protection
  useEffect(() => {
    if (!isReady || isAuthLoading) return;

    const isPublicRoute =
      pathname === '/' ||
      pathname === '/index' ||
      pathname === '/login' ||
      pathname === '/verify-otp' ||
      pathname.startsWith('/(auth)');

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/(auth)/login' as any);
    } else if (
      isAuthenticated &&
      (pathname === '/(auth)/login' ||
        pathname === '/login' ||
        pathname === '/(auth)/verify-otp' ||
        pathname === '/verify-otp' ||
        pathname === '/' ||
        pathname === '/index')
    ) {
      router.replace('/(tabs)/dashboard' as any);
    }
  }, [isReady, isAuthenticated, isAuthLoading, pathname]);

  if (!isReady || isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
