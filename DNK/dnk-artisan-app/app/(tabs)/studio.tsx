/**
 * AI Studio & Voice Catalog Wizard Screen
 * 5-Step Low-Literacy Onboarding Experience with Lucide vector icons:
 * Step 1: Camera Photo Capture (guided framing & ≤2MB compression)
 * Step 2: AI Studio Image Enhancement (/api/v1/ai/enhance-image) + StudioCompareViewer
 * Step 3: Voice Catalog Recording (/api/v1/ai/voice-catalog) + VoiceAssistantOverlay
 * Step 4: Attribute Review Cards with Audio Narration + AttributeReviewCard
 * Step 5: Omnichannel Pricing, Packaging & Publish (/api/v1/products) + ChannelPublishToggle
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  ClipboardCheck,
  CreditCard,
  Mic,
  Rocket,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react-native';
import { AttributeReviewCard } from '../../components/catalog/AttributeReviewCard';
import { CameraCaptureModal } from '../../components/catalog/CameraCaptureModal';
import { ChannelPublishToggle } from '../../components/catalog/ChannelPublishToggle';
import { StudioCompareViewer } from '../../components/catalog/StudioCompareViewer';
import { VoiceAssistantOverlay } from '../../components/catalog/VoiceAssistantOverlay';
import { AudioPromptButton } from '../../components/common/AudioPromptButton';
import { Header } from '../../components/common/Header';
import { Colors } from '../../constants/Colors';
import {
  VoiceCatalogExtractionResponse,
  enhanceImage,
} from '../../services/catalogService';
import {
  WizardStep,
  useCatalogDraftStore,
} from '../../store/useCatalogDraftStore';
import { useLanguageStore } from '../../store/useLanguageStore';

const STEPS: { key: WizardStep; num: number; labelKey: string; icon: any }[] = [
  { key: 'camera', num: 1, labelKey: 'step_camera', icon: Camera },
  { key: 'enhance', num: 2, labelKey: 'step_enhance', icon: Sparkles },
  { key: 'voice', num: 3, labelKey: 'step_voice', icon: Mic },
  { key: 'review', num: 4, labelKey: 'step_review', icon: ClipboardCheck },
  { key: 'pricing', num: 5, labelKey: 'step_pricing', icon: CreditCard },
];

export default function StudioScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const {
    currentStep,
    setStep,
    draft,
    updateDraft,
    publishDraft,
    isPublishing,
    syncStatus,
    syncError,
    loadDraftLocally,
    resetDraft,
  } = useCatalogDraftStore();

  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [voiceWarning, setVoiceWarning] = useState<string | null>(null);

  const hasVoiceData = Boolean(draft.audioUri || draft.title_en || draft.title_hi);

  useEffect(() => {
    void loadDraftLocally();
  }, []);

  const handleStepTabPress = (stepKey: WizardStep) => {
    if ((stepKey === 'review' || stepKey === 'pricing') && !hasVoiceData) {
      setVoiceWarning(t('voice_required_prompt'));
      return;
    }
    setVoiceWarning(null);
    setStep(stepKey);
  };

  const handleImageCaptured = (uri: string) => {
    updateDraft({ rawImageUri: uri, enhancedImageUri: null });
    setStep('enhance');
  };

  const handleTriggerEnhancement = async () => {
    if (!draft.rawImageUri) return;
    setIsEnhancing(true);
    setEnhanceError(null);

    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(draft.rawImageUri);
        const blob = await response.blob();
        formData.append('file', blob, 'craft_raw.jpg');
      } else {
        formData.append('file', {
          uri: draft.rawImageUri,
          name: 'craft_raw.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const res = await enhanceImage(formData);
      const enhancedUri = res.enhanced_url || draft.rawImageUri;
      updateDraft({ enhancedImageUri: enhancedUri });
    } catch (err: any) {
      const msg = err?.message || 'AI स्टूडियो संपादन उपलब्ध नहीं है | AI service currently unavailable.';
      setEnhanceError(msg);
      updateDraft({ enhancedImageUri: draft.rawImageUri });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleVoiceExtracted = (
    extraction: VoiceCatalogExtractionResponse,
    audioUri: string
  ) => {
    setVoiceWarning(null);
    updateDraft({
      audioUri,
      category: extraction.craft_category || extraction.category || draft.category,
      material_weave: extraction.material_weave || (extraction.materials ? extraction.materials.join(', ') : draft.material_weave),
      estimated_labor_days: extraction.estimated_labor_days || draft.estimated_labor_days,
      cost_price_inr: extraction.production_cost_inr || extraction.estimated_price_inr || draft.cost_price_inr,
      retail_price_inr: Math.round((extraction.production_cost_inr || draft.cost_price_inr) * 1.8),
      wholesale_price_inr: Math.round((extraction.production_cost_inr || draft.cost_price_inr) * 1.3),
      export_price_usd: Number(((extraction.production_cost_inr || draft.cost_price_inr) * 1.8 / 83.5).toFixed(2)),
      title_en: extraction.title_en || extraction.product_title_en || draft.title_en,
      title_hi: extraction.title_hi || extraction.translated_title_local || draft.title_hi,
      description_en: extraction.description_en || extraction.product_description_en || draft.description_en,
      description_hi: extraction.description_hi || extraction.translated_desc_local || draft.description_hi,
      hs_code: extraction.hs_code || draft.hs_code,
      weight_grams: extraction.weight_grams || draft.weight_grams,
    });
    setStep('review');
  };

  const handlePublish = async () => {
    const success = await publishDraft();
    if (success) {
      const msg = t('publish_success');
      if (Platform.OS === 'web') {
        window.alert(msg);
        router.replace('/(tabs)/dashboard' as any);
      } else {
        Alert.alert('DNK Marketplace', msg, [
          {
            text: 'View Dashboard',
            onPress: () => router.replace('/(tabs)/dashboard' as any),
          },
        ]);
      }
    }
  };

  const currentStepObj = STEPS.find((s) => s.key === currentStep) || STEPS[0];
  const stepInstruction = `${t('studio_wizard_title')}. ${t(currentStepObj.labelKey)}`;

  return (
    <View style={styles.container}>
      <Header
        showAudioHelp={true}
        audioPromptText={stepInstruction}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* WIZARD PROGRESS TRACKER */}
        <View style={styles.trackerWrapper}>
          <View style={styles.wizardHeaderRow}>
            <Sparkles size={20} color={Colors.primary} strokeWidth={2.4} />
            <Text style={styles.wizardMainTitle}>{t('studio_wizard_title')}</Text>
          </View>

          <View style={styles.stepTabsRow}>
            {STEPS.map((step) => {
              const isActive = step.key === currentStep;
              const isPast =
                STEPS.findIndex((s) => s.key === step.key) <
                STEPS.findIndex((s) => s.key === currentStep);

              const StepIcon = step.icon;

              return (
                <TouchableOpacity
                  key={step.key}
                  onPress={() => handleStepTabPress(step.key)}
                  style={[
                    styles.stepTab,
                    isActive && styles.activeStepTab,
                    isPast && styles.pastStepTab,
                  ]}
                  activeOpacity={0.8}
                >
                  <StepIcon
                    size={16}
                    color={
                      isActive
                        ? Colors.primary
                        : isPast
                        ? '#166534'
                        : '#6B7280'
                    }
                    strokeWidth={isActive ? 2.6 : 2.2}
                  />
                  <Text
                    style={[
                      styles.stepTabLabel,
                      isActive && styles.activeStepTabLabel,
                      isPast && styles.pastStepTabLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {t(step.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* VOICE WARNING BANNER */}
        {voiceWarning ? (
          <View style={styles.warningBanner}>
            <AlertCircle size={18} color="#991B1B" strokeWidth={2.2} />
            <Text style={styles.warningBannerText}>{voiceWarning}</Text>
          </View>
        ) : null}

        {/* STEP 1: CAMERA CAPTURE */}
        {currentStep === 'camera' && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepTitleRow}>
                <Camera size={20} color={Colors.primary} strokeWidth={2.4} />
                <Text style={styles.stepTitle}>{t('step_camera')}</Text>
              </View>
              <Text style={styles.stepSub}>
                {t('camera_step_sub')}
              </Text>
            </View>

            {draft.rawImageUri ? (
              <View style={styles.imagePreviewBox}>
                <Image
                  source={{ uri: draft.rawImageUri }}
                  style={styles.capturedPhoto}
                  resizeMode="contain"
                />
                <View style={styles.photoActionRow}>
                  <TouchableOpacity
                    onPress={() => setCameraModalVisible(true)}
                    style={styles.retakeButton}
                    activeOpacity={0.8}
                  >
                    <RotateCcw size={16} color="#4B5563" strokeWidth={2.2} />
                    <Text style={styles.retakeButtonText}>{t('btn_retake')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStep('enhance')}
                    style={styles.nextStepBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextStepBtnText}>
                      {t('step_enhance')}
                    </Text>
                    <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCaptureCard}>
                <Camera size={44} color="#9CA3AF" strokeWidth={2} />
                <Text style={styles.emptyCameraText}>
                  कोई फोटो चयनित नहीं है / No photo captured yet
                </Text>
                <TouchableOpacity
                  onPress={() => setCameraModalVisible(true)}
                  style={styles.launchCameraBtn}
                  activeOpacity={0.85}
                >
                  <Camera size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.launchCameraBtnText}>
                    {t('btn_take_photo')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: AI STUDIO IMAGE ENHANCEMENT */}
        {currentStep === 'enhance' && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepTitleRow}>
                <Sparkles size={20} color={Colors.primary} strokeWidth={2.4} />
                <Text style={styles.stepTitle}>{t('step_enhance')}</Text>
              </View>
              <Text style={styles.stepSub}>
                {t('enhance_step_sub')}
              </Text>
            </View>

            {draft.rawImageUri ? (
              <View style={styles.enhanceContentBox}>
                {draft.enhancedImageUri ? (
                  <StudioCompareViewer
                    rawImageUri={draft.rawImageUri}
                    enhancedImageUri={draft.enhancedImageUri}
                    height={340}
                  />
                ) : (
                  <View style={styles.pendingEnhanceCard}>
                    <Image
                      source={{ uri: draft.rawImageUri }}
                      style={styles.rawWaitingImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      onPress={handleTriggerEnhancement}
                      style={[
                        styles.enhanceTriggerBtn,
                        isEnhancing && { opacity: 0.6 },
                      ]}
                      disabled={isEnhancing}
                      activeOpacity={0.85}
                    >
                      {isEnhancing ? (
                        <View style={styles.loadingRow}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.enhanceTriggerBtnText}>
                            {t('enhancing_image')}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.loadingRow}>
                          <Sparkles size={18} color="#FFFFFF" strokeWidth={2.4} />
                          <Text style={styles.enhanceTriggerBtnText}>
                            {t('btn_enhance_ai')}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {enhanceError ? (
                  <View style={styles.errorCard}>
                    <AlertCircle size={16} color="#991B1B" strokeWidth={2.2} />
                    <Text style={styles.errorCardText}>{enhanceError}</Text>
                  </View>
                ) : null}

                <View style={styles.navigationRow}>
                  <TouchableOpacity
                    onPress={() => setStep('camera')}
                    style={styles.backStepBtn}
                  >
                    <ArrowLeft size={16} color="#4B5563" strokeWidth={2.4} />
                    <Text style={styles.backStepBtnText}>{t('step_camera')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStep('voice')}
                    style={styles.nextStepBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextStepBtnText}>
                      {t('step_voice')}
                    </Text>
                    <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCaptureCard}>
                <Camera size={44} color="#9CA3AF" strokeWidth={2} />
                <Text style={styles.emptyCameraText}>
                  कृपया पहले फोटो खींचें / Please capture a photo first
                </Text>
                <TouchableOpacity
                  onPress={() => setStep('camera')}
                  style={styles.launchCameraBtn}
                >
                  <ArrowLeft size={16} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.launchCameraBtnText}>{t('step_camera')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: VOICE CATALOGING */}
        {currentStep === 'voice' && (
          <View style={styles.stepContainer}>
            <VoiceAssistantOverlay onExtractionSuccess={handleVoiceExtracted} />

            <View style={styles.navigationRow}>
              <TouchableOpacity
                onPress={() => setStep('enhance')}
                style={styles.backStepBtn}
              >
                <ArrowLeft size={16} color="#4B5563" strokeWidth={2.4} />
                <Text style={styles.backStepBtnText}>{t('step_enhance')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (!hasVoiceData) {
                    setVoiceWarning(t('voice_required_prompt'));
                    return;
                  }
                  setVoiceWarning(null);
                  setStep('review');
                }}
                style={[
                  styles.nextStepBtn,
                  !hasVoiceData && { opacity: 0.6 },
                ]}
                activeOpacity={0.85}
              >
                <Text style={styles.nextStepBtnText}>
                  {t('step_review')}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 4: ATTRIBUTE REVIEW CARDS */}
        {currentStep === 'review' && (
          <View style={styles.stepContainer}>
            <AttributeReviewCard
              craftCategory={draft.category}
              materialWeave={draft.material_weave}
              laborDays={draft.estimated_labor_days}
              costPriceInr={draft.cost_price_inr}
              titleEn={draft.title_en}
              titleHi={draft.title_hi}
              descriptionEn={draft.description_en}
              descriptionHi={draft.description_hi}
              hsCode={draft.hs_code}
              onChange={(updates) => {
                updateDraft({
                  category: updates.craftCategory ?? draft.category,
                  material_weave: updates.materialWeave ?? draft.material_weave,
                  estimated_labor_days: updates.laborDays ?? draft.estimated_labor_days,
                  cost_price_inr: updates.costPriceInr ?? draft.cost_price_inr,
                  title_en: updates.titleEn ?? draft.title_en,
                  title_hi: updates.titleHi ?? draft.title_hi,
                  description_en: updates.descriptionEn ?? draft.description_en,
                  description_hi: updates.descriptionHi ?? draft.description_hi,
                  hs_code: updates.hsCode ?? draft.hs_code,
                });
              }}
            />

            <View style={styles.navigationRow}>
              <TouchableOpacity
                onPress={() => setStep('voice')}
                style={styles.backStepBtn}
              >
                <ArrowLeft size={16} color="#4B5563" strokeWidth={2.4} />
                <Text style={styles.backStepBtnText}>{t('step_voice')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep('pricing')}
                style={styles.nextStepBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.nextStepBtnText}>
                  {t('step_pricing')}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 5: OMNICHANNEL PRICING & LOGISTICS */}
        {currentStep === 'pricing' && (
          <View style={styles.stepContainer}>
            <ChannelPublishToggle
              isD2c={draft.is_d2c}
              isB2b={draft.is_b2b}
              isExport={draft.is_export}
              retailPriceInr={draft.retail_price_inr}
              wholesalePriceInr={draft.wholesale_price_inr}
              b2bMoq={draft.b2b_moq}
              exportPriceUsd={draft.export_price_usd}
              weightGrams={draft.weight_grams}
              boxLength={draft.dimensions_cm.length}
              boxWidth={draft.dimensions_cm.width}
              boxHeight={draft.dimensions_cm.height}
              isFragile={draft.is_fragile}
              onChange={(updates) => {
                updateDraft({
                  is_d2c: updates.isD2c ?? draft.is_d2c,
                  is_b2b: updates.isB2b ?? draft.is_b2b,
                  is_export: updates.isExport ?? draft.is_export,
                  retail_price_inr: updates.retailPriceInr ?? draft.retail_price_inr,
                  wholesale_price_inr: updates.wholesalePriceInr ?? draft.wholesale_price_inr,
                  b2b_moq: updates.b2bMoq ?? draft.b2b_moq,
                  export_price_usd: updates.exportPriceUsd ?? draft.export_price_usd,
                  weight_grams: updates.weightGrams ?? draft.weight_grams,
                  dimensions_cm: {
                    length: updates.boxLength ?? draft.dimensions_cm.length,
                    width: updates.boxWidth ?? draft.dimensions_cm.width,
                    height: updates.boxHeight ?? draft.dimensions_cm.height,
                  },
                  is_fragile: updates.isFragile ?? draft.is_fragile,
                });
              }}
            />

            {/* Offline Draft Status Notice */}
            <View style={styles.draftStatusBadge}>
              <Save size={13} color="#92400E" strokeWidth={2.4} />
              <Text style={styles.draftStatusText}>
                {t('draft_saved_local')}
              </Text>
            </View>

            {syncError ? (
              <View style={styles.errorCard}>
                <AlertCircle size={16} color="#991B1B" strokeWidth={2.2} />
                <Text style={styles.errorCardText}>{syncError}</Text>
              </View>
            ) : null}

            {/* PUBLISH CTA */}
            <View style={styles.publishBlock}>
              <TouchableOpacity
                onPress={handlePublish}
                style={[
                  styles.publishMainBtn,
                  isPublishing && { opacity: 0.6 },
                ]}
                disabled={isPublishing}
                activeOpacity={0.85}
              >
                {isPublishing ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.publishMainBtnText}>
                      {t('publishing')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <Rocket size={20} color="#FFFFFF" strokeWidth={2.6} />
                    <Text style={styles.publishMainBtnText}>
                      {t('btn_publish')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Guided Camera Modal */}
        <CameraCaptureModal
          visible={cameraModalVisible}
          onClose={() => setCameraModalVisible(false)}
          onImageCaptured={handleImageCaptured}
        />
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
  trackerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wizardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  wizardMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  stepTabsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  stepTab: {
    flex: 1,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  activeStepTab: {
    backgroundColor: '#FDF2F2',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  pastStepTab: {
    backgroundColor: '#F0FDF4',
  },
  stepTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeStepTabLabel: {
    color: Colors.primary,
    fontWeight: '900',
  },
  pastStepTabLabel: {
    color: '#166534',
  },
  stepContainer: {
    width: '100%',
  },
  stepHeader: {
    marginBottom: 14,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  stepSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyCaptureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  emptyCameraText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
  },
  launchCameraBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  launchCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  imagePreviewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  capturedPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  retakeButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
  },
  nextStepBtn: {
    flex: 1.5,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextStepBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  backStepBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backStepBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  enhanceContentBox: {
    width: '100%',
  },
  pendingEnhanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  rawWaitingImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginBottom: 14,
  },
  enhanceTriggerBtn: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhanceTriggerBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  errorCardText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  draftStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
    gap: 6,
  },
  draftStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  publishBlock: {
    marginTop: 16,
  },
  publishMainBtn: {
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  publishMainBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
});
