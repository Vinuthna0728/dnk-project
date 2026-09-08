/**
 * PermanentSidebar Component (Desktop Web)
 * Elegant, responsive sidebar for desktop / laptop displays (≥768px)
 * with Lucide vector icons.
 */

import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { IS_DEMO_MODE } from '../constants/Config';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';

export function PermanentSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguageStore();
  const { user, logout } = useAuthStore();

  if (Platform.OS !== 'web') {
    return null;
  }

  const primaryNavItems = [
    {
      label: t('tab_dashboard'),
      icon: LayoutDashboard,
      route: '/(tabs)/dashboard',
    },
    {
      label: t('tab_studio'),
      icon: Sparkles,
      route: '/(tabs)/studio',
    },
    {
      label: t('tab_orders'),
      icon: Package,
      route: '/(tabs)/orders',
    },
    {
      label: t('tab_dropoff'),
      icon: MapPin,
      route: '/(tabs)/dnk-dropoff',
    },
  ];

  const handleLogout = () => {
    const confirmMsg = t('logout_confirm');
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        void logout();
        router.replace('/(auth)/login' as any);
      }
    } else {
      Alert.alert(t('logout'), confirmMsg, [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: () => {
            void logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]);
    }
  };

  const userInitials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : 'AE';

  return (
    <View style={styles.sidebarContainer}>
      {/* BRAND & EMBLEM HEADER */}
      <View style={styles.brandBlock}>
        <View style={styles.postLogoWrapper}>
          <Text style={styles.postLogoHindi}>{t('india_post')}</Text>
          <Text style={styles.postLogoEng}>India Post</Text>
        </View>
        <Text style={styles.brandTitle} numberOfLines={1}>
          {t('app_title')}
        </Text>
        <Text style={styles.brandSub}>
          {IS_DEMO_MODE ? 'Development Demo' : t('app_subtitle')}
        </Text>
      </View>

      {/* ARTISAN USER PROFILE CARD */}
      <View style={styles.profileBox}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.artisanName} numberOfLines={1}>
            {user?.name || 'Master Artisan'}
          </Text>
          <Text style={styles.artisanId}>
            ID: DNK-2026-{String(user?.id || '001').padStart(4, '0')}
          </Text>
          {user?.phone ? (
            <Text style={styles.artisanPhone}>{user.phone}</Text>
          ) : null}
        </View>
      </View>

      {/* NAVIGATION MENU */}
      <View style={styles.navMenu}>
        <Text style={styles.menuSectionTitle}>PORTAL NAVIGATION</Text>
        <View style={styles.navGroup}>
          {primaryNavItems.map((item) => {
            const isActive =
              pathname === item.route ||
              (item.route === '/(tabs)/dashboard' &&
                (pathname === '/(tabs)' || pathname === '/(tabs)/index'));

            const IconComponent = item.icon;

            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                style={[styles.navItem, isActive && styles.activeNavItem]}
                activeOpacity={0.8}
              >
                <IconComponent
                  size={19}
                  color={isActive ? Colors.primary : '#6B7280'}
                  strokeWidth={isActive ? 2.6 : 2.2}
                />
                <Text
                  style={[styles.navLabel, isActive && styles.activeNavLabel]}
                >
                  {item.label}
                </Text>
                {isActive ? <View style={styles.activeIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FOOTER & LOGOUT */}
      <View style={styles.footerBlock}>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#991B1B" strokeWidth={2.2} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.trustText}>
          Ministry of Communications • Govt. of India
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 260,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  brandBlock: {
    marginBottom: 20,
  },
  postLogoWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  postLogoHindi: {
    color: '#FFD54F',
    fontSize: 9,
    fontWeight: '800',
  },
  postLogoEng: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 1,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  profileInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  artisanId: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  artisanPhone: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  navMenu: {
    flex: 1,
  },
  menuSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  navGroup: {
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    gap: 12,
    position: 'relative',
  },
  activeNavItem: {
    backgroundColor: '#FDF2F2',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    flex: 1,
  },
  activeNavLabel: {
    color: Colors.primary,
    fontWeight: '900',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  footerBlock: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    gap: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    gap: 10,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  trustText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default PermanentSidebar;
