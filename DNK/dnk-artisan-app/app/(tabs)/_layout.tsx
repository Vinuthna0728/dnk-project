/**
 * TabLayout Component
 * Universal adaptive layout:
 * - Mobile: Icon-driven bottom navigation tab bar (48px+ touch targets) with Lucide icons
 * - Desktop Web: PermanentSidebar on left with spacious responsive content area
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  LayoutDashboard,
  MapPin,
  Package,
  Sparkles,
} from 'lucide-react-native';
import { PermanentSidebar } from '../../components/PermanentSidebar';
import { Colors } from '../../constants/Colors';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function TabLayout() {
  const { t } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  return (
    <View style={styles.layoutContainer}>
      {/* Desktop Web Sidebar */}
      {isDesktop ? <PermanentSidebar /> : null}

      <View style={styles.contentContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              display: isDesktop ? 'none' : 'flex',
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1.5,
              borderTopColor: '#EFE9DF',
              height: 64,
              paddingBottom: 8,
              paddingTop: 8,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
            },
            tabBarItemStyle: {
              minHeight: 48,
            },
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: t('tab_dashboard'),
              tabBarIcon: ({ color, focused }) => (
                <LayoutDashboard
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.6 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="studio"
            options={{
              title: t('tab_studio'),
              tabBarIcon: ({ color, focused }) => (
                <Sparkles
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.6 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: t('tab_orders'),
              tabBarIcon: ({ color, focused }) => (
                <Package
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.6 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="dnk-dropoff"
            options={{
              title: t('tab_dropoff'),
              tabBarIcon: ({ color, focused }) => (
                <MapPin
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.6 : 2}
                />
              ),
            }}
          />

          {/* Root Tab Redirect */}
          <Tabs.Screen
            name="index"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
    height: '100%',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    height: '100%',
  },
});