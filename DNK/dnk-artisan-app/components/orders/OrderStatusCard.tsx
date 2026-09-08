/**
 * OrderStatusCard Component
 * Displays visual progress timeline (Pending -> Dropped -> In Transit -> Delivered),
 * order metadata, and toggleable PostalManifestQR code with Lucide vector icons.
 */

import React, { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Package,
  Plane,
  Printer,
  QrCode,
  Scale,
  ShoppingBag,
  Tag,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { ArtisanOrder } from '../../services/orderService';
import { useLanguageStore } from '../../store/useLanguageStore';
import { PostalManifestQR } from './PostalManifestQR';

interface OrderStatusCardProps {
  order: ArtisanOrder;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ order }) => {
  const { t } = useLanguageStore();
  const [showQr, setShowQr] = useState(false);

  const getStepIndex = (status: ArtisanOrder['status']) => {
    switch (status) {
      case 'PENDING_DROPOFF':
        return 0;
      case 'SCANNED_AT_DNK':
        return 1;
      case 'IN_TRANSIT':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  const steps = [
    { key: 'pending', label: t('status_pending'), icon: Clock },
    { key: 'dropped', label: t('status_dropped'), icon: Building2 },
    { key: 'transit', label: t('status_in_transit'), icon: Plane },
    { key: 'delivered', label: t('status_delivered'), icon: CheckCircle2 },
  ];

  const handlePrint = () => {
    const msg = `CN23 Customs Declaration Printed\n\nOrder: ${order.order_number}\nTracking: ${order.tracking_number || 'Pending'}\nDestination: ${order.destination_country}\nCentre: ${order.dnk_centre_name || 'DNK Post Office'}`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Postal Thermal Print', msg);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Meta Bar */}
      <View style={styles.topRow}>
        <View style={styles.orderIdentGroup}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.destText}>
            {order.destination_country} • {order.buyer_name}
          </Text>
        </View>

        <View
          style={[
            styles.channelBadge,
            order.channel === 'EXPORT'
              ? styles.exportBadge
              : order.channel === 'B2B'
              ? styles.b2bBadge
              : styles.d2cBadge,
          ]}
        >
          {order.channel === 'EXPORT' ? (
            <Globe size={13} color="#166534" strokeWidth={2.4} />
          ) : order.channel === 'B2B' ? (
            <Building2 size={13} color="#92400E" strokeWidth={2.4} />
          ) : (
            <ShoppingBag size={13} color="#1E40AF" strokeWidth={2.4} />
          )}
          <Text style={styles.channelBadgeText}>
            {order.channel === 'EXPORT'
              ? t('tab_export')
              : order.channel === 'B2B'
              ? t('tab_b2b')
              : t('tab_d2c')}
          </Text>
        </View>
      </View>

      {/* Product Title & Details */}
      <View style={styles.detailsBlock}>
        <Text style={styles.productTitle}>{order.product_title}</Text>
        <View style={styles.tagsRow}>
          <View style={styles.tagBadge}>
            <Tag size={12} color="#4B5563" strokeWidth={2.2} />
            <Text style={styles.tagText}>HS: {order.hs_code}</Text>
          </View>
          <View style={styles.tagBadge}>
            <Scale size={12} color="#4B5563" strokeWidth={2.2} />
            <Text style={styles.tagText}>{order.weight_grams}g</Text>
          </View>
          <View style={styles.tagBadge}>
            <Package size={12} color="#4B5563" strokeWidth={2.2} />
            <Text style={styles.tagText}>Qty: {order.quantity}</Text>
          </View>
          <View style={styles.payoutBadge}>
            <Text style={styles.payoutText}>
              ₹{order.amount_inr.toLocaleString('en-IN')}
              {order.amount_usd ? ` ($${order.amount_usd})` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Visual Progress Timeline */}
      <View style={styles.timelineWrapper}>
        <View style={styles.timelineTrack}>
          <View
            style={[
              styles.timelineProgress,
              { width: `${(currentStep / 3) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.timelineNodesRow}>
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;
            const StepIcon = step.icon;
            return (
              <View key={step.key} style={styles.timelineNodeBlock}>
                <View
                  style={[
                    styles.nodeDot,
                    isCompleted && styles.nodeDotCompleted,
                    isCurrent && styles.nodeDotCurrent,
                  ]}
                >
                  <StepIcon
                    size={14}
                    color={
                      isCurrent
                        ? '#D97706'
                        : isCompleted
                        ? '#1B4D3E'
                        : '#9CA3AF'
                    }
                    strokeWidth={2.4}
                  />
                </View>
                <Text
                  style={[
                    styles.nodeLabel,
                    isCompleted && styles.nodeLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Toggle QR Section */}
      {showQr ? (
        <PostalManifestQR
          orderId={order.id}
          trackingNumber={order.tracking_number}
          dnkCentreName={order.dnk_centre_name}
        />
      ) : null}

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => setShowQr(!showQr)}
          style={[styles.qrToggleBtn, showQr && styles.qrToggleBtnActive]}
          activeOpacity={0.8}
        >
          <QrCode size={16} color={showQr ? Colors.primary : Colors.textPrimary} strokeWidth={2.2} />
          <Text style={[styles.qrToggleBtnText, showQr && styles.qrToggleBtnTextActive]}>
            {showQr ? t('btn_close_qr') : t('btn_show_qr')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePrint}
          style={styles.printBtn}
          activeOpacity={0.85}
        >
          <Printer size={16} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.printBtnText}>{t('btn_print_label')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  orderIdentGroup: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  destText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  exportBadge: {
    backgroundColor: '#DCFCE7',
  },
  b2bBadge: {
    backgroundColor: '#FEF3C7',
  },
  d2cBadge: {
    backgroundColor: '#DBEAFE',
  },
  channelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },
  detailsBlock: {
    marginVertical: 6,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE9DF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  payoutBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  payoutText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#166534',
  },
  timelineWrapper: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  timelineTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'relative',
    marginHorizontal: 16,
    top: 14,
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#1B4D3E',
    borderRadius: 2,
  },
  timelineNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineNodeBlock: {
    alignItems: 'center',
    width: 68,
  },
  nodeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDotCompleted: {
    backgroundColor: '#DCFCE7',
    borderColor: '#1B4D3E',
  },
  nodeDotCurrent: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
    transform: [{ scale: 1.15 }],
  },
  nodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  nodeLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  qrToggleBtn: {
    flex: 1.2,
    height: 44,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  qrToggleBtnActive: {
    backgroundColor: '#FDF2F2',
    borderColor: Colors.primary,
  },
  qrToggleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  qrToggleBtnTextActive: {
    color: Colors.primary,
  },
  printBtn: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default OrderStatusCard;
