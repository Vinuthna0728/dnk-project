/**
 * Artisan Landing & Splash Screen
 * Cultural artisan storytelling with 1-tap dialect selector,
 * Lucide vector iconography, and instant transition to login or dashboard.
 */

import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Camera,
  Mic,
  PackageCheck,
} from 'lucide-react-native';
import { AudioPromptButton } from '../components/common/AudioPromptButton';
import { Header } from '../components/common/Header';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();

  const handleStart = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard' as any);
    } else {
      router.push('/(auth)/login' as any);
    }
  };

  const audioWelcome = `${t('app_title')}. ${t('splash_tagline')}. ${t('splash_btn_start')}`;

  return (
    <View style={styles.container}>
      <Header showAudioHelp={true} audioPromptText={audioWelcome} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO BANNER SECTION */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={require('../assets/artisan-banner.png')}
            style={styles.heroBannerImage}
            resizeMode="cover"
            imageStyle={{ borderRadius: 20 }}
          >
            <View style={styles.heroOverlay}>
              <View style={styles.govBadge}>
                <Text style={styles.govBadgeText}>
                  {t('splash_badge')}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{t('app_title')}</Text>
              <Text style={styles.heroSubtitle}>{t('splash_tagline')}</Text>
            </View>
          </ImageBackground>
        </View>

        {/* CULTURAL WORKFLOW PILLARS */}
        <View style={styles.workflowGrid}>
          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Camera size={24} color="#B45309" strokeWidth={2.4} />
            </View>
            <Text style={styles.pillarTitle}>{t('splash_pillar_1_title')}</Text>
            <Text style={styles.pillarDesc}>
              {t('splash_pillar_1_desc')}
            </Text>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Mic size={24} color="#166534" strokeWidth={2.4} />
            </View>
            <Text style={styles.pillarTitle}>{t('splash_pillar_2_title')}</Text>
            <Text style={styles.pillarDesc}>
              {t('splash_pillar_2_desc')}
            </Text>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconCircle, { backgroundColor: '#DBEAFE' }]}>
              <PackageCheck size={24} color="#1E40AF" strokeWidth={2.4} />
            </View>
            <Text style={styles.pillarTitle}>{t('splash_pillar_3_title')}</Text>
            <Text style={styles.pillarDesc}>
              {t('splash_pillar_3_desc')}
            </Text>
          </View>
        </View>

        {/* PRIMARY CALL TO ACTION */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            onPress={handleStart}
            style={styles.primaryCtaBtn}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('splash_btn_start')}
          >
            <View style={styles.btnRow}>
              <Text style={styles.primaryCtaBtnText}>
                {t('splash_btn_start')}
              </Text>
              <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.8} />
            </View>
          </TouchableOpacity>

          <View style={styles.audioPromptWrapper}>
            <AudioPromptButton
              textToSpeak={audioWelcome}
              size={44}
              label={t('audio_listen')}
              variant="card"
            />
          </View>
        </View>

        {/* TRUST FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('splash_footer')}
          </Text>
        </View>
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
    paddingBottom: 50,
    alignItems: 'center',
  },
  heroSection: {
    width: '100%',
    maxWidth: 960,
    marginBottom: 24,
  },
  heroBannerImage: {
    width: '100%',
    height: 280,
    overflow: 'hidden',
    borderRadius: 20,
    justifyContent: 'flex-end',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  heroOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  govBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD54F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  govBadgeText: {
    color: '#1F2937',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFD54F',
    marginTop: 4,
  },
  workflowGrid: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  pillarCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pillarIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pillarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  pillarDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  ctaContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 16,
    marginBottom: 30,
  },
  primaryCtaBtn: {
    width: '100%',
    height: 58,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  audioPromptWrapper: {
    alignItems: 'center',
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});