/**
 * PostalManifestQR Component
 * High-density, high-contrast QR Code for Postal Counter Check-in.
 * Contains real Order ID + Postal Tracking Code
 * rendered cleanly with SVG and Lucide vector icons.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MapPin, QrCode } from 'lucide-react-native';
import QRCode from 'qrcode';
import Svg, { Rect } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { useLanguageStore } from '../../store/useLanguageStore';

interface PostalManifestQRProps {
  orderId: string | number;
  trackingNumber?: string;
  size?: number;
  dnkCentreName?: string;
}

export const PostalManifestQR: React.FC<PostalManifestQRProps> = ({
  orderId,
  trackingNumber,
  size = 220,
  dnkCentreName,
}) => {
  const { t } = useLanguageStore();

  const qrPayload = JSON.stringify({
    portal: 'DNK_INDIA_POST',
    order_id: String(orderId),
    tracking_code: trackingNumber || 'PENDING_REGISTRATION',
    timestamp: new Date().toISOString(),
  });

  const matrix = useMemo(() => {
    try {
      const qr = QRCode.create(qrPayload, { errorCorrectionLevel: 'M' });
      return qr.modules;
    } catch (err) {
      console.warn('[PostalManifestQR] QR generation error:', err);
      return null;
    }
  }, [qrPayload]);

  const moduleCount = matrix ? matrix.size : 0;
  const cellSize = moduleCount > 0 ? size / moduleCount : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.postBadge}>
          <Text style={styles.postBadgeText}>INDIA POST • DNK</Text>
        </View>
        <Text style={styles.trackingText}>
          {trackingNumber ? trackingNumber : t('tracking_unavailable')}
        </Text>
      </View>

      {/* QR Code Canvas */}
      <View style={[styles.qrBox, { width: size + 24, height: size + 24 }]}>
        {matrix ? (
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" />
            {Array.from(matrix.data).map((isDark, index) => {
              if (!isDark) return null;
              const row = Math.floor(index / moduleCount);
              const col = index % moduleCount;
              return (
                <Rect
                  key={`cell-${row}-${col}`}
                  x={col * cellSize}
                  y={row * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#000000"
                />
              );
            })}
          </Svg>
        ) : (
          <View style={styles.fallbackBox}>
            <QrCode size={40} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.fallbackText}>QR Generating...</Text>
          </View>
        )}
      </View>

      <Text style={styles.instruction}>{t('qr_sub')}</Text>

      {dnkCentreName ? (
        <View style={styles.centreBadge}>
          <MapPin size={13} color={Colors.primary} strokeWidth={2.4} />
          <Text style={styles.centreText}>{dnkCentreName}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  postBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  postBadgeText: {
    color: '#FFD54F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  trackingText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fallbackText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  instruction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 260,
  },
  centreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE9DF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    gap: 6,
  },
  centreText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default PostalManifestQR;
