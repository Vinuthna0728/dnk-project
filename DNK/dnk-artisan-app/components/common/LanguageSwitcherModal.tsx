/**
 * LanguageSwitcherModal Component
 * 1-Tap Dialect Switcher with native scripts (हिन्दी, ಕನ್ನಡ, தமிழ், বাংলা, English)
 * and Lucide vector icons (Globe, Check, X).
 */

import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, Globe, X } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { SupportedLanguage, useLanguageStore } from '../../store/useLanguageStore';

interface LanguageSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

interface LanguageOption {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  region: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    region: 'उत्तर एवं मध्य भारत (North & Central India)',
  },
  {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    region: 'ಕರ್ನಾಟಕ (Karnataka)',
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    region: 'தமிழ்நாடு (Tamil Nadu)',
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    region: 'পশ্চিমবঙ্গ (West Bengal)',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    region: 'Pan-India & Global Export',
  },
];

export const LanguageSwitcherModal: React.FC<LanguageSwitcherModalProps> = ({
  visible,
  onClose,
}) => {
  const { currentLang, setLanguage, t, speakText } = useLanguageStore();

  const handleSelectLanguage = async (langCode: SupportedLanguage) => {
    await setLanguage(langCode);
    const selected = LANGUAGES.find((l) => l.code === langCode);
    if (selected) {
      void speakText(selected.nativeName);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Globe size={22} color={Colors.primary} strokeWidth={2.2} />
              <View>
                <Text style={styles.titleText}>{t('select_language')}</Text>
                <Text style={styles.subText}>{t('choose_dialect')}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Close language selector"
            >
              <X size={18} color="#4B5563" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Dialects List */}
          <View style={styles.langList}>
            {LANGUAGES.map((item) => {
              const isSelected = item.code === currentLang;
              return (
                <TouchableOpacity
                  key={item.code}
                  onPress={() => handleSelectLanguage(item.code)}
                  style={[
                    styles.langCard,
                    isSelected && styles.selectedLangCard,
                  ]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.nativeName} (${item.englishName})`}
                >
                  <View style={styles.langInfoBlock}>
                    <Text
                      style={[
                        styles.nativeNameText,
                        isSelected && styles.selectedNativeText,
                      ]}
                    >
                      {item.nativeName}
                    </Text>
                    <Text style={styles.englishNameText}>
                      {item.englishName} • {item.region}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.selectedCheckCircle,
                    ]}
                  >
                    {isSelected ? (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langList: {
    gap: 10,
  },
  langCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    minHeight: 56,
  },
  selectedLangCard: {
    backgroundColor: '#FDF2F2',
    borderColor: Colors.primary,
  },
  langInfoBlock: {
    flex: 1,
  },
  nativeNameText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  selectedNativeText: {
    color: Colors.primary,
  },
  englishNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckCircle: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});

export default LanguageSwitcherModal;
