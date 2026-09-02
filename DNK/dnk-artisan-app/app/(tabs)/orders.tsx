/**
 * Artisan Orders & Postal Manifest Screen
 * Unified D2C / B2B / Export orders with visual progress timelines
 * and high-contrast PostalManifestQR counter drop-off barcodes with Lucide vector icons.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  Building2,
  Globe,
  Package,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { OrderStatusCard } from '../../components/orders/OrderStatusCard';
import { Colors } from '../../constants/Colors';
import { ArtisanOrder, OrderChannel, fetchOrders } from '../../services/orderService';
import { useLanguageStore } from '../../store/useLanguageStore';

type FilterTab = 'ALL' | OrderChannel;

export default function OrdersScreen() {
  const { t } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [orders, setOrders] = useState<ArtisanOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const list = await fetchOrders();
      setOrders(list);
    } catch (err: any) {
      setErrorMessage(t('error_connection'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter((o) => o.channel === activeTab);

  const audioSummary = `${t('orders_title')}. Total orders: ${orders.length}.`;

  return (
    <View style={styles.container}>
      <Header showAudioHelp={true} audioPromptText={audioSummary} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen Title */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Package size={24} color={Colors.primary} strokeWidth={2.4} />
            <Text style={styles.titleText}>{t('orders_title')}</Text>
          </View>
          <Text style={styles.subText}>
            {t('orders_subtitle')}
          </Text>
        </View>

        {/* Filter Tabs (ALL / D2C / B2B / EXPORT) */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('ALL')}
            style={[styles.tabBtn, activeTab === 'ALL' && styles.activeTabBtn]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'ALL' && styles.activeTabBtnText]}>
              {t('tab_all')} ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('EXPORT')}
            style={[styles.tabBtn, activeTab === 'EXPORT' && styles.activeTabBtn]}
            activeOpacity={0.8}
          >
            <Globe
              size={13}
              color={activeTab === 'EXPORT' ? '#FFFFFF' : '#4B5563'}
              strokeWidth={2.2}
            />
            <Text style={[styles.tabBtnText, activeTab === 'EXPORT' && styles.activeTabBtnText]}>
              {t('tab_export')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('B2B')}
            style={[styles.tabBtn, activeTab === 'B2B' && styles.activeTabBtn]}
            activeOpacity={0.8}
          >
            <Building2
              size={13}
              color={activeTab === 'B2B' ? '#FFFFFF' : '#4B5563'}
              strokeWidth={2.2}
            />
            <Text style={[styles.tabBtnText, activeTab === 'B2B' && styles.activeTabBtnText]}>
              {t('tab_b2b')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('D2C')}
            style={[styles.tabBtn, activeTab === 'D2C' && styles.activeTabBtn]}
            activeOpacity={0.8}
          >
            <ShoppingBag
              size={13}
              color={activeTab === 'D2C' ? '#FFFFFF' : '#4B5563'}
              strokeWidth={2.2}
            />
            <Text style={[styles.tabBtnText, activeTab === 'D2C' && styles.activeTabBtnText]}>
              {t('tab_d2c')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ERROR STATE */}
        {errorMessage ? (
          <View style={styles.errorCard}>
            <AlertCircle size={28} color="#991B1B" strokeWidth={2.2} />
            <Text style={styles.errorTitle}>{t('error_connection_title')}</Text>
            <Text style={styles.errorSub}>{errorMessage}</Text>
            <TouchableOpacity onPress={loadOrders} style={styles.retryBtn}>
              <RefreshCw size={13} color="#DC2626" strokeWidth={2.4} />
              <Text style={styles.retryBtnText}>{t('btn_retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* LOADING INDICATOR */}
        {isLoading && !errorMessage ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : null}

        {/* ORDERS LIST / EMPTY STATE */}
        {!isLoading && !errorMessage ? (
          filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Package size={40} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.emptyTitle}>{t('no_orders_title')}</Text>
              <Text style={styles.emptySub}>{t('no_orders_sub')}</Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => (
                <OrderStatusCard key={order.id} order={order} />
              ))}
            </View>
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  titleBlock: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    gap: 4,
    flexWrap: 'wrap',
  },
  tabBtn: {
    flex: 1,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  activeTabBtn: {
    backgroundColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4B5563',
  },
  activeTabBtnText: {
    color: '#FFFFFF',
  },
  ordersList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginTop: 10,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 340,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#991B1B',
  },
  errorSub: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
    gap: 6,
  },
  retryBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
});
