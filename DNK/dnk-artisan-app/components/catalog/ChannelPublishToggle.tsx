/**
 * ChannelPublishToggle Component
 * Multi-Select Channel Activator:
 * 1. Domestic Retail (D2C)
 * 2. Domestic Wholesale (B2B Bulk) with MOQ Stepper
 * 3. DNK Global Export with USD pricing & compliance viability badge
 * + Physical attribute steppers (weight in 50g steps & standard box sizes)
 * with Lucide vector icons.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertTriangle,
  Box,
  Building2,
  Check,
  Globe,
  Minus,
  Plus,
  Scale,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { STANDARD_BOX_SIZES } from '../../constants/Config';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AudioPromptButton } from '../common/AudioPromptButton';

interface ChannelPublishToggleProps {
  isD2c: boolean;
  isB2b: boolean;
  isExport: boolean;
  retailPriceInr: number;
  wholesalePriceInr: number;
  b2bMoq: number;
  exportPriceUsd: number;
  weightGrams: number;
  boxLength: number;
  boxWidth: number;
  boxHeight: number;
  isFragile: boolean;
  onChange: (updates: {
    isD2c?: boolean;
    isB2b?: boolean;
    isExport?: boolean;
    retailPriceInr?: number;
    wholesalePriceInr?: number;
    b2bMoq?: number;
    exportPriceUsd?: number;
    weightGrams?: number;
    boxLength?: number;
    boxWidth?: number;
    boxHeight?: number;
    isFragile?: boolean;
  }) => void;
}

export const ChannelPublishToggle: React.FC<ChannelPublishToggleProps> = ({
  isD2c,
  isB2b,
  isExport,
  retailPriceInr,
  wholesalePriceInr,
  b2bMoq,
  exportPriceUsd,
  weightGrams,
  boxLength,
  boxWidth,
  boxHeight,
  isFragile,
  onChange,
}) => {
  const { t } = useLanguageStore();

  const handleStepWeight = (delta: number) => {
    const next = Math.max(50, weightGrams + delta);
    onChange({ weightGrams: next });
  };

  const handleStepMoq = (delta: number) => {
    const next = Math.max(2, b2bMoq + delta);
    onChange({ b2bMoq: next });
  };

  const handleSelectBox = (box: (typeof STANDARD_BOX_SIZES)[number]) => {
    onChange({
      boxLength: box.dimensions.length,
      boxWidth: box.dimensions.width,
      boxHeight: box.dimensions.height,
    });
  };

  const isCurrentBox = (box: (typeof STANDARD_BOX_SIZES)[number]) => {
    return (
      box.dimensions.length === boxLength &&
      box.dimensions.width === boxWidth &&
      box.dimensions.height === boxHeight
    );
  };

  return (
    <View style={styles.container}>
      {/* SECTION 1: OMNICHANNEL SALES CHANNELS */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Globe size={22} color={Colors.primary} strokeWidth={2.4} />
          <Text style={styles.sectionTitle}>{t('section_sales_channels')}</Text>
        </View>
        <AudioPromptButton
          textToSpeak="Choose your sales channels: Retail D2C, Wholesale B2B, and Global Export."
          size={32}
        />
      </View>

      <View style={styles.channelCards}>
        {/* Channel 1: Domestic Retail (D2C) */}
        <View style={[styles.channelCard, isD2c && styles.activeChannelCard]}>
          <View style={styles.channelTopRow}>
            <TouchableOpacity
              onPress={() => onChange({ isD2c: !isD2c })}
              style={styles.checkboxTouch}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isD2c && styles.checkboxActive]}>
                {isD2c ? <Check size={16} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              <View>
                <View style={styles.channelTitleRow}>
                  <ShoppingBag size={16} color={Colors.textPrimary} strokeWidth={2.4} />
                  <Text style={styles.channelTitle}>{t('channel_d2c_title')}</Text>
                </View>
                <Text style={styles.channelSub}>{t('channel_d2c_sub')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isD2c ? (
            <View style={styles.channelInputRow}>
              <Text style={styles.priceSymbol}>₹</Text>
              <TextInput
                value={String(retailPriceInr)}
                onChangeText={(val) => {
                  const num = parseInt(val, 10) || 0;
                  onChange({
                    retailPriceInr: num,
                    exportPriceUsd: Number((num / 83.5).toFixed(2)),
                  });
                }}
                keyboardType="numeric"
                style={styles.priceInput}
              />
              <Text style={styles.priceUnit}>INR ({t('tab_d2c')})</Text>
            </View>
          ) : null}
        </View>

        {/* Channel 2: Domestic Wholesale (B2B Bulk) */}
        <View style={[styles.channelCard, isB2b && styles.activeChannelCard]}>
          <View style={styles.channelTopRow}>
            <TouchableOpacity
              onPress={() => onChange({ isB2b: !isB2b })}
              style={styles.checkboxTouch}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isB2b && styles.checkboxActive]}>
                {isB2b ? <Check size={16} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              <View>
                <View style={styles.channelTitleRow}>
                  <Building2 size={16} color={Colors.textPrimary} strokeWidth={2.4} />
                  <Text style={styles.channelTitle}>{t('channel_b2b_title')}</Text>
                </View>
                <Text style={styles.channelSub}>{t('channel_b2b_sub')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isB2b ? (
            <View style={styles.b2bInputsBlock}>
              <View style={styles.channelInputRow}>
                <Text style={styles.priceSymbol}>₹</Text>
                <TextInput
                  value={String(wholesalePriceInr)}
                  onChangeText={(val) =>
                    onChange({ wholesalePriceInr: parseInt(val, 10) || 0 })
                  }
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <Text style={styles.priceUnit}>INR / Unit</Text>
              </View>

              {/* MOQ Stepper */}
              <View style={styles.stepperRow}>
                <Text style={styles.stepperLabel}>{t('moq_label')}:</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    onPress={() => handleStepMoq(-5)}
                    style={styles.stepBtn}
                    activeOpacity={0.75}
                  >
                    <Minus size={16} color={Colors.textPrimary} strokeWidth={2.4} />
                  </TouchableOpacity>
                  <Text style={styles.stepValueText}>{b2bMoq} Units</Text>
                  <TouchableOpacity
                    onPress={() => handleStepMoq(5)}
                    style={styles.stepBtn}
                    activeOpacity={0.75}
                  >
                    <Plus size={16} color={Colors.textPrimary} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {/* Channel 3: DNK Global Export */}
        <View style={[styles.channelCard, isExport && styles.activeChannelCard]}>
          <View style={styles.channelTopRow}>
            <TouchableOpacity
              onPress={() => onChange({ isExport: !isExport })}
              style={styles.checkboxTouch}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isExport && styles.checkboxActive]}>
                {isExport ? <Check size={16} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              <View>
                <View style={styles.channelTitleRow}>
                  <Globe size={16} color={Colors.textPrimary} strokeWidth={2.4} />
                  <Text style={styles.channelTitle}>{t('channel_export_title')}</Text>
                </View>
                <Text style={styles.channelSub}>{t('channel_export_sub')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isExport ? (
            <View style={styles.exportInputsBlock}>
              <View style={styles.channelInputRow}>
                <Text style={styles.priceSymbol}>$</Text>
                <TextInput
                  value={String(exportPriceUsd)}
                  onChangeText={(val) =>
                    onChange({ exportPriceUsd: parseFloat(val) || 0 })
                  }
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <Text style={styles.priceUnit}>USD ({t('tab_export')})</Text>
              </View>

              {/* Export Compliance Indicator Badge */}
              <View style={styles.complianceBadge}>
                <ShieldCheck size={14} color="#166534" strokeWidth={2.4} />
                <Text style={styles.complianceBadgeText}>
                  {t('export_viable_approved')}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {/* SECTION 2: LOGISTICS, WEIGHT & PACKAGING BOX */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <View style={styles.sectionTitleRow}>
          <Box size={22} color={Colors.primary} strokeWidth={2.4} />
          <Text style={styles.sectionTitle}>{t('section_logistics_pkg')}</Text>
        </View>
        <AudioPromptButton
          textToSpeak="Select parcel weight and packaging box size."
          size={32}
        />
      </View>

      {/* Weight Stepper (+/- 50g) */}
      <View style={styles.weightBox}>
        <View style={styles.weightHeaderRow}>
          <Scale size={16} color="#4B5563" strokeWidth={2.2} />
          <Text style={styles.weightLabel}>{t('pkg_weight')}</Text>
        </View>
        <View style={styles.weightStepperRow}>
          <TouchableOpacity
            onPress={() => handleStepWeight(-50)}
            style={styles.weightStepBtn}
            activeOpacity={0.75}
          >
            <Text style={styles.weightStepBtnText}>- 50g</Text>
          </TouchableOpacity>

          <View style={styles.weightDisplay}>
            <Text style={styles.weightDisplayText}>{weightGrams} g</Text>
            <Text style={styles.weightDisplayKg}>
              ({(weightGrams / 1000).toFixed(2)} kg)
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleStepWeight(50)}
            style={styles.weightStepBtn}
            activeOpacity={0.75}
          >
            <Text style={styles.weightStepBtnText}>+ 50g</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Standard Box Size Picker */}
      <View style={styles.boxGrid}>
        {STANDARD_BOX_SIZES.map((box) => {
          const selected = isCurrentBox(box);
          return (
            <TouchableOpacity
              key={box.id}
              onPress={() => handleSelectBox(box)}
              style={[styles.boxCard, selected && styles.activeBoxCard]}
              activeOpacity={0.8}
            >
              <Box size={22} color={selected ? Colors.primary : '#6B7280'} strokeWidth={2.2} />
              <Text style={[styles.boxTitle, selected && styles.activeBoxTitle]}>
                {box.label}
              </Text>
              <Text style={styles.boxDims}>
                {box.dimensions.length}×{box.dimensions.width}×{box.dimensions.height} cm
              </Text>
              <Text style={styles.boxDesc} numberOfLines={2}>
                {box.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Fragile Switch Card */}
      <TouchableOpacity
        onPress={() => onChange({ isFragile: !isFragile })}
        style={[styles.fragileCard, isFragile && styles.activeFragileCard]}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, isFragile && styles.checkboxActive]}>
          {isFragile ? <Check size={16} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <View style={styles.fragileContent}>
          <View style={styles.fragileTitleRow}>
            <AlertTriangle size={16} color={isFragile ? '#D97706' : '#4B5563'} strokeWidth={2.4} />
            <Text style={styles.fragileTitle}>{t('is_fragile')}</Text>
          </View>
          <Text style={styles.fragileSub}>
            {t('fragile_sub')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  channelCards: {
    gap: 12,
  },
  channelCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
  },
  activeChannelCard: {
    backgroundColor: '#FDF2F2',
    borderColor: Colors.primary,
  },
  channelTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  channelSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  channelInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginTop: 10,
    gap: 8,
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#1B4D3E',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  b2bInputsBlock: {
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValueText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  exportInputsBlock: {
    marginTop: 4,
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
    gap: 6,
  },
  complianceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  weightBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    marginBottom: 12,
  },
  weightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weightLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  weightStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weightStepBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  weightStepBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  weightDisplay: {
    alignItems: 'center',
  },
  weightDisplayText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  weightDisplayKg: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  boxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  boxCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    alignItems: 'center',
    gap: 2,
  },
  activeBoxCard: {
    backgroundColor: '#FDF2F2',
    borderColor: Colors.primary,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  activeBoxTitle: {
    color: Colors.primary,
  },
  boxDims: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4D3E',
    marginTop: 2,
  },
  boxDesc: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  fragileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    gap: 12,
  },
  activeFragileCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  fragileContent: {
    flex: 1,
  },
  fragileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fragileTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  fragileSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ChannelPublishToggle;
