import React from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { useLanguageStore } from '../store/useLanguageStore';
import { clearAuthToken } from '../services/api';

export function PermanentSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { t, profile } = useLanguageStore();

    if (Platform.OS !== 'web') {
        return null;
    }

    const primaryNavItems = [
        {
            label: t('tab_home'),
            icon: '🏠',
            route: '/(tabs)',
        },
        {
            label: t('tab_add'),
            icon: '➕',
            route: '/(tabs)/voice-catalog',
        },
        {
            label: t('tab_products'),
            icon: '🛍️',
            route: '/(tabs)/products',
        },
        {
            label: t('tab_orders'),
            icon: '📦',
            route: '/(tabs)/orders',
        },
        {
            label: t('tab_payouts'),
            icon: '💰',
            route: '/(tabs)/payouts',
        },
    ];

    const secondaryNavItems = [
        {
            label: t('tab_settings'),
            icon: '⚙️',
            route: '/(tabs)/settings',
        },
    ];

    const performLogout = async () => {
        try {
            await clearAuthToken();
            router.replace('/');
        } catch (error) {
            console.error('Logout failed:', error);
            router.replace('/');
        }
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            const confirmLogout = window.confirm(
                t('logout_confirm')
            );

            if (confirmLogout) {
                void performLogout();
            }

            return;
        }

        Alert.alert(
            'Logout',
            t('logout_confirm'),
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        void performLogout();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.sidebarContainer}>

            {/* ARTISAN PROFILE */}
            <View style={styles.profileBox}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                        {profile.name
                            ? profile.name
                                .substring(0, 2)
                                .toUpperCase()
                            : 'AE'}
                    </Text>
                </View>

                <View style={styles.profileInfo}>
                    <Text style={styles.artisanName} numberOfLines={1}>
                        {profile.name}
                    </Text>

                    <Text style={styles.artisanId}>
                        ID: {profile.id}
                    </Text>
                </View>
            </View>

            {/* NAVIGATION */}
            <View style={styles.navMenu}>
                {/* PRIMARY NAVIGATION */}
                <View style={styles.navGroup}>
                    {primaryNavItems.map((item) => {
                        const isActive =
                            pathname === item.route ||
                            (
                                item.route === '/(tabs)' &&
                                (pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index')
                            );

                        return (
                            <TouchableOpacity
                                key={item.route}
                                onPress={() =>
                                    router.push(
                                        item.route as any
                                    )
                                }
                                style={[
                                    styles.navItem,
                                    isActive &&
                                        styles.navItemActive,
                                ]}
                            >
                                <Text style={styles.navIcon}>
                                    {item.icon}
                                </Text>

                                <Text
                                    style={[
                                        styles.navLabel,
                                        isActive &&
                                            styles.navLabelActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.divider} />

                {/* SECONDARY NAVIGATION */}
                <View style={styles.navGroup}>
                    {secondaryNavItems.map((item) => {
                        const isActive =
                            pathname === item.route;

                        return (
                            <TouchableOpacity
                                key={item.route}
                                onPress={() =>
                                    router.push(
                                        item.route as any
                                    )
                                }
                                style={[
                                    styles.navItem,
                                    isActive &&
                                        styles.navItemActive,
                                ]}
                            >
                                <Text style={styles.navIcon}>
                                    {item.icon}
                                </Text>

                                <Text
                                    style={[
                                        styles.navLabel,
                                        isActive &&
                                            styles.navLabelActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* LOGOUT */}
                <View style={styles.logoutGroup}>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutBtn}
                    >
                        <Text style={styles.logoutIcon}>
                            🚪
                        </Text>

                        <Text style={styles.logoutLabel}>
                            {t('logout')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebarContainer: {
        width: 240,
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        height: '100%',
        flexDirection: 'column',
        zIndex: 100,
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    avatarCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#8B2222',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 15,
    },
    profileInfo: {
        flex: 1,
    },
    artisanName: {
        fontSize: 14,
        fontWeight: '900',
        color: '#111827',
    },
    artisanId: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8B2222',
        marginTop: 2,
    },
    navMenu: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },
    navGroup: {
        gap: 6,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    navItemActive: {
        backgroundColor: '#FEE2E2',
    },
    navIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    navLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4B5563',
    },
    navLabelActive: {
        color: '#8B2222',
        fontWeight: '900',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    logoutGroup: {
        marginTop: 'auto',
        paddingTop: 10,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    logoutIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    logoutLabel: {
        fontSize: 13,
        fontWeight: '800',
        color: '#DC2626',
    },
});
