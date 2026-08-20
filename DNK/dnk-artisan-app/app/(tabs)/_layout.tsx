import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { PermanentSidebar } from '../../components/PermanentSidebar';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function TabLayout() {
  const { t } = useLanguageStore();

  return (
    <View style={styles.layoutContainer}>
      <PermanentSidebar />

      <View style={styles.contentContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#8B2222',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              display: Platform.OS === 'web' ? 'none' : 'flex',
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t('tab_home'),
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text>,
            }}
          />
          <Tabs.Screen
            name="voice-catalog"
            options={{
              title: t('tab_add'),
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎙️</Text>,
            }}
          />
          <Tabs.Screen
            name="products"
            options={{
              title: t('tab_products'),
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>🛍️</Text>,
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: t('tab_orders'),
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>📦</Text>,
            }}
          />
          <Tabs.Screen
            name="payouts"
            options={{
              title: t('tab_payouts'),
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>📈</Text>,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: t('tab_settings'),
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>⚙️</Text>,
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
    backgroundColor: '#F4F5F7',
    height: '100%',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    height: '100%',
  },
});