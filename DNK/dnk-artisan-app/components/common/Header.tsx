/**
 * Application Header Component
 * Indian Postal / DNK Identity, 1-tap dialect switch with Globe icon,
 * network connectivity indicator, and audio narration trigger.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Globe, Wifi, WifiOff } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { IS_DEMO_MODE } from '../../constants/Config';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AudioPromptButton } from './AudioPromptButton';
import { LanguageSwitcherModal } from './LanguageSwitcherModal';

interface HeaderProps {
  userInitials?: string;
  showAudioHelp?: boolean;
  audioPromptText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userInitials = 'AE',
  showAudioHelp = true,
  audioPromptText,
}) => {
  const { currentLang, t } = useLanguageStore();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Network listener
  useEffect(() => {
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const languageLabels: Record<string, string> = {
    hi: 'हिन्दी',
    kn: 'ಕನ್ನಡ',
    ta: 'தமிழ்',
    bn: 'বাংলা',
    en: 'English',
  };

  return (
    <View style={styles.headerWrapper}>
      {/* BRAND & LOGO SECTION */}
      <View style={styles.leftBrandBlock}>
        <View style={styles.postEmblem}>
          <Text style={styles.postEmblemHi}>डाक</Text>
          <Text style={styles.postEmblemEn}>POST</Text>
        </View>

        <View style={styles.titleColumn}>
          <Text style={styles.brandTitle} numberOfLines={1}>
            {t('app_title')}
          </Text>
          <Text style={styles.brandSub}>
            {IS_DEMO_MODE ? 'DNK Artisan (Dev Demo)' : t('app_subtitle')}
          </Text>
        </View>
      </View>

      {/* RIGHT ACTION CONTROLS */}
      <View style={styles.rightActionsRow}>
        {/* Offline / Online Status Indicator */}
        <View
          style={[
            styles.networkBadge,
            isOnline ? styles.onlineBadge : styles.offlineBadge,
          ]}
        >
          {isOnline ? (
            <Wifi size={13} color="#166534" strokeWidth={2.4} />
          ) : (
            <WifiOff size={13} color="#991B1B" strokeWidth={2.4} />
          )}
          <Text
            style={[
              styles.networkText,
              isOnline ? styles.onlineText : styles.offlineText,
            ]}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* 1-Tap Dialect Switcher Button */}
        <TouchableOpacity
          onPress={() => setLangModalVisible(true)}
          style={styles.langPickerButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Change Language"
        >
          <Globe size={16} color={Colors.primary} strokeWidth={2.2} />
          <Text style={styles.langPickerText}>
            {languageLabels[currentLang] || 'हिन्दी'}
          </Text>
        </TouchableOpacity>

        {/* Screen-Level Audio Narration Trigger */}
        {showAudioHelp && audioPromptText ? (
          <AudioPromptButton
            textToSpeak={audioPromptText}
            size={40}
            variant="minimal"
          />
        ) : null}
      </View>

      {/* Dialect Selection Modal */}
      <LanguageSwitcherModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EFE9DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  leftBrandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  postEmblem: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  postEmblemHi: {
    color: '#FFD54F',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  postEmblemEn: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 10,
  },
  titleColumn: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  onlineBadge: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  offlineBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  networkText: {
    fontSize: 10,
    fontWeight: '800',
  },
  onlineText: {
    color: '#166534',
  },
  offlineText: {
    color: '#991B1B',
  },
  langPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
    minHeight: 40,
  },
  langPickerText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default Header;
