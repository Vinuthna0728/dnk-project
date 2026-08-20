import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { HeaderBanner } from '../../components/HeaderBanner';
import { useLanguageStore } from '../../store/useLanguageStore';
import { fetchMyOrders } from '../../services/api';

interface DropoffOrder {
  orderId: string;
  trackingNo: string;
  item: string;
  hsCode: string;
  weight: string;
  destination: string;
  buyerName: string;
  status: 'PENDING_DROPOFF' | 'SCANNED_AT_DNK';
  payoutAmount: number;
}

export default function OrdersScreen() {
  const { t, profile } = useLanguageStore();
  const [liveOrders, setLiveOrders] = useState<DropoffOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchMyOrders()
      .then((backendOrders) => {
        if (!isMounted) return;
        const mapped: DropoffOrder[] = (backendOrders || []).map((ord: any) => ({
          orderId: `ORD-2026-${ord.id}`,
          trackingNo: `DNK${String(ord.id).padStart(9, '0')}IN`,
          item: `Export Product #${ord.product_id || ord.id}`,
          hsCode: ord.hs_code || '9503.00.90',
          weight: '1.25 kg',
          destination: ord.country || 'Global Export Destination',
          buyerName: `Overseas Buyer #${ord.buyer_id || 1}`,
          status: ord.status === 'POSTAL_ACCEPTED' ? 'SCANNED_AT_DNK' : 'PENDING_DROPOFF',
          payoutAmount: Number(ord.amount_inr || 1200),
        }));
        setLiveOrders(mapped);
      })
      .catch((_) => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrintLabel = (order: DropoffOrder) => {
    const msg = `${t('label_printed_success')}\n\nTracking No: ${order.trackingNo}\nDrop-off Centre: ${profile.dnkCentre}`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert("Thermal Printer", msg);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBanner userInitials={profile.name ? profile.name.substring(0, 2).toUpperCase() : 'KA'} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Header */}
        <View style={styles.headerBox}>
          <Text style={styles.titleText}>{t('orders_screen_title')}</Text>
          <Text style={styles.subText}>{t('orders_screen_sub')}</Text>
        </View>

        {isLoading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color="#8B2222" />
            <Text style={styles.loadingText}>Loading orders from backend...</Text>
          </View>
        ) : liveOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubText}>
              When international buyers purchase your crafts, postal drop-off instructions and CN23 customs labels will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {liveOrders.map((order) => (
              <View key={order.orderId} style={styles.orderCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderIdText}>{order.orderId}</Text>
                    <Text style={styles.destText}>✈️ {order.destination} • {order.buyerName}</Text>
                  </View>
                  <View style={order.status === 'SCANNED_AT_DNK' ? styles.scannedBadge : styles.pendingBadge}>
                    <Text style={order.status === 'SCANNED_AT_DNK' ? styles.scannedText : styles.pendingText}>
                      {order.status === 'SCANNED_AT_DNK' ? '✅ Scanned at DNK' : '🕒 Ready for Drop-off'}
                    </Text>
                  </View>
                </View>

                {/* Package Details */}
                <View style={styles.detailsBody}>
                  <Text style={styles.itemTitle}>{order.item}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaTag}>HS: {order.hsCode}</Text>
                    <Text style={styles.metaTag}>⚖️ {order.weight}</Text>
                    <Text style={styles.priceTag}>Artisan Payout: ₹{order.payoutAmount}.00</Text>
                  </View>

                  {/* CN23 Customs Label Preview */}
                  <View style={styles.cn23Box}>
                    <View style={styles.cn23Header}>
                      <Text style={styles.cn23Title}>INDIA POST • CN23 CUSTOMS DECLARATION</Text>
                      <Text style={styles.cn23Tracking}>{order.trackingNo}</Text>
                    </View>
                    <View style={styles.barcodeVisual}>
                      <Text style={styles.barcodeLines}>||| | ||||| || |||| ||| |||| | |||| ||| ||</Text>
                      <Text style={styles.barcodeText}>{order.trackingNo}</Text>
                    </View>
                    <Text style={styles.dnkBranchNote}>Drop at: {profile.dnkCentre}</Text>
                  </View>

                  {/* Print Button */}
                  <TouchableOpacity
                    onPress={() => handlePrintLabel(order)}
                    style={styles.printBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.printBtnText}>{t('print_thermal_label')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 50 },
  headerBox: { marginBottom: 20, alignItems: 'center' },
  titleText: { fontSize: 24, fontWeight: '900', color: '#1F2937' },
  subText: { fontSize: 13, color: '#4B5563', marginTop: 4, textAlign: 'center' },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    maxWidth: 600,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  loadingText: { fontSize: 14, color: '#6B7280', fontWeight: '700', marginTop: 12 },
  ordersList: { width: '100%', maxWidth: 760, gap: 18 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderIdText: { fontSize: 16, fontWeight: '900', color: '#111827' },
  destText: { fontSize: 12, color: '#4B5563', marginTop: 2, fontWeight: '600' },
  pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  pendingText: { color: '#92400E', fontSize: 11, fontWeight: '800' },
  scannedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  scannedText: { color: '#166534', fontSize: 11, fontWeight: '800' },
  detailsBody: { padding: 18 },
  itemTitle: { fontSize: 18, fontWeight: '900', color: '#8B2222' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  metaTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: '700', color: '#374151' },
  priceTag: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: '800', color: '#0B7B3E' },

  // CN23 Label Box
  cn23Box: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    padding: 14,
    marginVertical: 14,
  },
  cn23Header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cn23Title: { fontSize: 10, fontWeight: '900', color: '#92400E', letterSpacing: 0.5 },
  cn23Tracking: { fontSize: 11, fontWeight: '900', color: '#111827' },
  barcodeVisual: { alignItems: 'center', marginVertical: 8, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 6 },
  barcodeLines: { fontSize: 18, letterSpacing: 4, fontWeight: '900', color: '#111827' },
  barcodeText: { fontSize: 10, color: '#6B7280', fontWeight: '800', marginTop: 2 },
  dnkBranchNote: { fontSize: 10, color: '#78350F', fontWeight: '700', textAlign: 'center' },

  // Button
  printBtn: {
    backgroundColor: '#0B3B73',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#0B3B73',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  printBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
});
