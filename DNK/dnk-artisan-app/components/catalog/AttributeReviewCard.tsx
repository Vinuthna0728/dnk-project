/**
 * AttributeReviewCard Component
 * Visual cards for reviewing extracted craft attributes,
 * material & weave, labor days, production cost, bilingual title & description,
 * with Lucide vector icons and integrated AudioPromptButton.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ClipboardList,
  Clock,
  Coins,
  Edit3,
  Layers,
  Save,
  Tag,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AudioPromptButton } from '../common/AudioPromptButton';

interface AttributeReviewCardProps {
  craftCategory: string;
  materialWeave: string;
  laborDays: number;
  costPriceInr: number;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  hsCode: string;
  onChange: (updates: {
    craftCategory?: string;
    materialWeave?: string;
    laborDays?: number;
    costPriceInr?: number;
    titleEn?: string;
    titleHi?: string;
    descriptionEn?: string;
    descriptionHi?: string;
    hsCode?: string;
  }) => void;
}

export const AttributeReviewCard: React.FC<AttributeReviewCardProps> = ({
  craftCategory,
  materialWeave,
  laborDays,
  costPriceInr,
  titleEn,
  titleHi,
  descriptionEn,
  descriptionHi,
  hsCode,
  onChange,
}) => {
  const { t } = useLanguageStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <ClipboardList size={22} color={Colors.primary} strokeWidth={2.4} />
          <Text style={styles.headerTitle}>{t('step_review')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editToggleBtn}
          activeOpacity={0.8}
        >
          {isEditing ? (
            <Save size={14} color={Colors.primary} strokeWidth={2.4} />
          ) : (
            <Edit3 size={14} color={Colors.primary} strokeWidth={2.4} />
          )}
          <Text style={styles.editToggleText}>
            {isEditing ? t('attr_save') : t('attr_edit')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsGrid}>
        {/* Card 1: Craft Category & HS Code */}
        <View style={styles.attributeCard}>
          <View style={styles.attrHeader}>
            <View style={styles.attrHeaderTitleRow}>
              <Layers size={16} color="#4B5563" strokeWidth={2.2} />
              <Text style={styles.attrLabel}>{t('attr_craft_category')}</Text>
            </View>
            <AudioPromptButton
              textToSpeak={`${t('attr_craft_category')}: ${craftCategory}. HS Code: ${hsCode}`}
              size={32}
            />
          </View>
          {isEditing ? (
            <TextInput
              value={craftCategory}
              onChangeText={(val) => onChange({ craftCategory: val })}
              style={styles.inputField}
            />
          ) : (
            <Text style={styles.attrValue}>{craftCategory || 'Handicrafts'}</Text>
          )}
          <View style={styles.hsBadge}>
            <Text style={styles.hsBadgeText}>HS Code: {hsCode || '6913.90.00'}</Text>
          </View>
        </View>

        {/* Card 2: Material & Weave Type */}
        <View style={styles.attributeCard}>
          <View style={styles.attrHeader}>
            <View style={styles.attrHeaderTitleRow}>
              <Tag size={16} color="#4B5563" strokeWidth={2.2} />
              <Text style={styles.attrLabel}>{t('attr_material')}</Text>
            </View>
            <AudioPromptButton
              textToSpeak={`${t('attr_material')}: ${materialWeave}`}
              size={32}
            />
          </View>
          {isEditing ? (
            <TextInput
              value={materialWeave}
              onChangeText={(val) => onChange({ materialWeave: val })}
              style={styles.inputField}
            />
          ) : (
            <Text style={styles.attrValue}>{materialWeave || 'Natural Craft Materials'}</Text>
          )}
        </View>

        {/* Card 3: Labor Days & Production Cost */}
        <View style={styles.attributeCard}>
          <View style={styles.attrHeader}>
            <View style={styles.attrHeaderTitleRow}>
              <Clock size={16} color="#4B5563" strokeWidth={2.2} />
              <Text style={styles.attrLabel}>{t('attr_labor_days')} & {t('attr_cost_price')}</Text>
            </View>
            <AudioPromptButton
              textToSpeak={`${t('attr_labor_days')}: ${laborDays} days. ${t('attr_cost_price')}: ${costPriceInr} rupees.`}
              size={32}
            />
          </View>
          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <Text style={styles.splitSubLabel}>{t('attr_labor_days')}</Text>
              {isEditing ? (
                <TextInput
                  value={String(laborDays)}
                  onChangeText={(val) => onChange({ laborDays: parseInt(val, 10) || 1 })}
                  keyboardType="numeric"
                  style={styles.inputField}
                />
              ) : (
                <Text style={styles.splitValue}>{laborDays} {t('days_unit')}</Text>
              )}
            </View>
            <View style={styles.splitItem}>
              <Text style={styles.splitSubLabel}>{t('attr_cost_price')}</Text>
              {isEditing ? (
                <TextInput
                  value={String(costPriceInr)}
                  onChangeText={(val) => onChange({ costPriceInr: parseInt(val, 10) || 0 })}
                  keyboardType="numeric"
                  style={styles.inputField}
                />
              ) : (
                <Text style={styles.splitValueGreen}>₹{costPriceInr}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Card 4: Bilingual Titles */}
        <View style={styles.attributeCard}>
          <View style={styles.attrHeader}>
            <View style={styles.attrHeaderTitleRow}>
              <Tag size={16} color="#4B5563" strokeWidth={2.2} />
              <Text style={styles.attrLabel}>{t('attr_title_hi')} / {t('attr_title_en')}</Text>
            </View>
            <AudioPromptButton textToSpeak={`${titleHi || titleEn}`} size={32} />
          </View>
          <Text style={styles.langSubLabel}>{t('label_regional_lang')}</Text>
          {isEditing ? (
            <TextInput
              value={titleHi}
              onChangeText={(val) => onChange({ titleHi: val })}
              style={styles.inputField}
            />
          ) : (
            <Text style={styles.attrValue}>{titleHi || titleEn || 'हस्तशिल्प उत्पाद'}</Text>
          )}

          <Text style={[styles.langSubLabel, { marginTop: 8 }]}>{t('label_english')}</Text>
          {isEditing ? (
            <TextInput
              value={titleEn}
              onChangeText={(val) => onChange({ titleEn: val })}
              style={styles.inputField}
            />
          ) : (
            <Text style={styles.attrValueSecondary}>{titleEn || 'Handcrafted Artisan Craft'}</Text>
          )}
        </View>

        {/* Card 5: Bilingual Descriptions */}
        <View style={styles.attributeCard}>
          <View style={styles.attrHeader}>
            <View style={styles.attrHeaderTitleRow}>
              <ClipboardList size={16} color="#4B5563" strokeWidth={2.2} />
              <Text style={styles.attrLabel}>{t('attr_desc_hi')} / {t('attr_desc_en')}</Text>
            </View>
            <AudioPromptButton textToSpeak={`${descriptionHi || descriptionEn}`} size={32} />
          </View>
          <Text style={styles.langSubLabel}>{t('label_regional_lang')}</Text>
          {isEditing ? (
            <TextInput
              value={descriptionHi}
              onChangeText={(val) => onChange({ descriptionHi: val })}
              multiline
              style={[styles.inputField, styles.multilineInput]}
            />
          ) : (
            <Text style={styles.attrDescText}>{descriptionHi || descriptionEn || 'पारंपरिक हस्तनिर्मित उत्पाद'}</Text>
          )}

          <Text style={[styles.langSubLabel, { marginTop: 8 }]}>{t('label_english')}</Text>
          {isEditing ? (
            <TextInput
              value={descriptionEn}
              onChangeText={(val) => onChange({ descriptionEn: val })}
              multiline
              style={[styles.inputField, styles.multilineInput]}
            />
          ) : (
            <Text style={styles.attrDescText}>{descriptionEn || 'Authentic artisan handmade handicraft'}</Text>
          )}
        </View>
      </View>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  editToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardsGrid: {
    gap: 12,
  },
  attributeCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
  },
  attrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  attrHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attrLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  attrValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  attrValueSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  attrDescText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
    marginTop: 2,
  },
  langSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  hsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  hsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  splitItem: {
    flex: 1,
  },
  splitSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  splitValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  splitValueGreen: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1B4D3E',
    marginTop: 2,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
});

export default AttributeReviewCard;
