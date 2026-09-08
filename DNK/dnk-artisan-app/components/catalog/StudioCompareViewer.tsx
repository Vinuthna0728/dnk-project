/**
 * StudioCompareViewer Component
 * Interactive Before / After slider & split viewer
 * comparing raw photo against clean AI Vision Studio backdrop (with shadow synthesis)
 * using Lucide vector icons.
 */

import React, { useState } from 'react';
import {
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  Columns,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useLanguageStore } from '../../store/useLanguageStore';

interface StudioCompareViewerProps {
  rawImageUri: string;
  enhancedImageUri: string;
  height?: number;
}

export const StudioCompareViewer: React.FC<StudioCompareViewerProps> = ({
  rawImageUri,
  enhancedImageUri,
  height = 320,
}) => {
  const { t } = useLanguageStore();
  const [sliderPosition, setSliderPosition] = useState(0.5); // 0 to 1 (50% split)
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPos = Math.max(0.05, Math.min(0.95, gestureState.moveX / 400));
      setSliderPosition(newPos);
    },
  });

  return (
    <View style={styles.wrapper}>
      {/* Mode Switcher Header */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.aiBadge}>
            <Sparkles size={13} color="#166534" strokeWidth={2.4} />
            <Text style={styles.aiBadgeText}>AI Studio 2.0</Text>
          </View>
          <Text style={styles.subHint}>{t('drag_to_compare')}</Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setViewMode('slider')}
            style={[styles.toggleBtn, viewMode === 'slider' && styles.activeToggleBtn]}
            activeOpacity={0.8}
          >
            <SlidersHorizontal
              size={13}
              color={viewMode === 'slider' ? Colors.primary : '#6B7280'}
              strokeWidth={2.2}
            />
            <Text style={[styles.toggleText, viewMode === 'slider' && styles.activeToggleText]}>
              Slider
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('sideBySide')}
            style={[styles.toggleBtn, viewMode === 'sideBySide' && styles.activeToggleBtn]}
            activeOpacity={0.8}
          >
            <Columns
              size={13}
              color={viewMode === 'sideBySide' ? Colors.primary : '#6B7280'}
              strokeWidth={2.2}
            />
            <Text style={[styles.toggleText, viewMode === 'sideBySide' && styles.activeToggleText]}>
              Side-by-Side
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Viewer Content */}
      {viewMode === 'slider' ? (
        <View style={[styles.compareContainer, { height }]}>
          {/* Enhanced Image (Background Layer) */}
          <Image
            source={{ uri: enhancedImageUri || rawImageUri }}
            style={styles.fullImage}
            resizeMode="cover"
          />
          <View style={styles.enhancedLabelBadge}>
            <Sparkles size={11} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.enhancedLabelText}>{t('compare_studio')}</Text>
          </View>

          {/* Raw Image (Clipped Left Layer) */}
          <View
            style={[
              styles.rawClippedContainer,
              { width: `${sliderPosition * 100}%` },
            ]}
          >
            <Image
              source={{ uri: rawImageUri }}
              style={[styles.fullImage, { width: 500 }]}
              resizeMode="cover"
            />
            <View style={styles.rawLabelBadge}>
              <Camera size={11} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.rawLabelText}>{t('compare_raw')}</Text>
            </View>
          </View>

          {/* Draggable Divider Line & Handle */}
          <View
            style={[
              styles.sliderDivider,
              { left: `${sliderPosition * 100}%` },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderHandle}>
              <SlidersHorizontal size={14} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </View>
        </View>
      ) : (
        /* Side by Side Split View */
        <View style={styles.sideBySideRow}>
          <View style={styles.sideCard}>
            <Image source={{ uri: rawImageUri }} style={styles.sideImage} resizeMode="cover" />
            <View style={styles.sideBadgeRaw}>
              <Camera size={11} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.sideBadgeText}>{t('compare_raw')}</Text>
            </View>
          </View>

          <View style={styles.sideCard}>
            <Image
              source={{ uri: enhancedImageUri || rawImageUri }}
              style={styles.sideImage}
              resizeMode="cover"
            />
            <View style={styles.sideBadgeEnhanced}>
              <Sparkles size={11} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.sideBadgeText}>{t('compare_studio')}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  subHint: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  activeToggleBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeToggleText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  compareContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAF7F2',
    position: 'relative',
  },
  fullImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  rawClippedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  sliderDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: -2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  sliderHandle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  rawLabelBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rawLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  enhancedLabelBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 77, 62, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  enhancedLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sideCard: {
    flex: 1,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    position: 'relative',
    backgroundColor: '#FAF7F2',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  sideBadgeRaw: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  sideBadgeEnhanced: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 77, 62, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  sideBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default StudioCompareViewer;
