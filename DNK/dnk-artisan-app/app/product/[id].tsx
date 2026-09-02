/**
 * Product Detail & Channel Pricing Editor Screen
 * Route: /product/[id]
 * Renders full craft details, Studio Compare viewer, and live omnichannel pricing editor
 * with Lucide vector icons.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Layers,
  RefreshCw,
  Save,
  Tag,
  Trash2,
} from 'lucide-react-native';
import { ChannelPublishToggle } from '../../components/catalog/ChannelPublishToggle';
import { StudioCompareViewer } from '../../components/catalog/StudioCompareViewer';
import { AudioPromptButton } from '../../components/common/AudioPromptButton';
import { Header } from '../../components/common/Header';
import { Colors } from '../../constants/Colors';
import {
  ArtisanProduct,
  deleteProduct,
  fetchProductById,
  updateProduct,
} from '../../services/catalogService';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguageStore();

  const [product, setProduct] = useState<ArtisanProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const item = await fetchProductById(id);
      setProduct(item);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'उत्पाद लोड नहीं हो सका | Unable to load product details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProduct();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!product || !id) return;
    setIsSaving(true);
    try {
      const updated = await updateProduct(id, product);
      setProduct(updated);
      const msg = t('product_updated_success');
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('DNK Catalog', msg);
      }
    } catch (err: any) {
      const msg = t('product_update_error');
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmMsg = 'क्या आप इस उत्पाद को हटाना चाहते हैं? / Are you sure you want to delete this product?';
    const doDelete = Platform.OS === 'web' ? window.confirm(confirmMsg) : true;

    if (doDelete && id) {
      try {
        await deleteProduct(id);
        router.replace('/(tabs)/dashboard' as any);
      } catch (err: any) {
        alert(err?.message || 'हटाने में त्रुटि | Failed to delete product.');
      }
    }
  };

  const audioDetail = product
    ? `${product.title_hi || product.title_en}. Retail price: ₹${product.pricing.retail_price_inr}. Export price: $${product.pricing.export_price_usd} USD.`
    : 'Product details';

  return (
    <View style={styles.container}>
      <Header showAudioHelp={true} audioPromptText={audioDetail} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>उत्पाद विवरण लोड हो रहा है...</Text>
          </View>
        ) : null}

        {/* Error State */}
        {errorMessage ? (
          <View style={styles.errorCard}>
            <AlertCircle size={28} color="#991B1B" strokeWidth={2.2} />
            <Text style={styles.errorTitle}>{errorMessage}</Text>
            <TouchableOpacity onPress={loadProduct} style={styles.retryBtn}>
              <RefreshCw size={13} color="#DC2626" strokeWidth={2.4} />
              <Text style={styles.retryBtnText}>{t('btn_retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isLoading && product ? (
          <View style={styles.contentBlock}>
            {/* Header & Back Action */}
            <View style={styles.topNavRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <ArrowLeft size={16} color={Colors.textPrimary} strokeWidth={2.4} />
                <Text style={styles.backBtnText}>{t('tab_dashboard')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteHeaderBtn}
                activeOpacity={0.8}
              >
                <Trash2 size={15} color="#DC2626" strokeWidth={2.2} />
                <Text style={styles.deleteHeaderBtnText}>{t('btn_delete')}</Text>
              </TouchableOpacity>
            </View>

            {/* Product Title & HS Code Header */}
            <View style={styles.titleCard}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.titleHi}>
                    {product.title_hi || product.title_en}
                  </Text>
                  <Text style={styles.titleEn}>{product.title_en}</Text>
                </View>
                <AudioPromptButton textToSpeak={audioDetail} size={36} />
              </View>

              <View style={styles.badgesRow}>
                <View style={styles.categoryBadge}>
                  <Layers size={13} color={Colors.primary} strokeWidth={2.4} />
                  <Text style={styles.categoryBadgeText}>
                    {product.category}
                  </Text>
                </View>
                <View style={styles.hsBadge}>
                  <Tag size={13} color="#92400E" strokeWidth={2.4} />
                  <Text style={styles.hsBadgeText}>
                    HS: {product.hs_code}
                  </Text>
                </View>
              </View>

              <Text style={styles.descriptionText}>
                {product.description_hi || product.description_en}
              </Text>
            </View>

            {/* AI Studio Image Comparison Viewer */}
            {product.images.raw_url ? (
              <StudioCompareViewer
                rawImageUri={product.images.raw_url}
                enhancedImageUri={product.images.enhanced_url || product.images.raw_url}
                height={320}
              />
            ) : null}

            {/* Omnichannel Channel & Pricing Editor */}
            <ChannelPublishToggle
              isD2c={product.channels.is_d2c}
              isB2b={product.channels.is_b2b}
              isExport={product.channels.is_export}
              retailPriceInr={product.pricing.retail_price_inr}
              wholesalePriceInr={product.pricing.wholesale_price_inr}
              b2bMoq={product.pricing.b2b_moq}
              exportPriceUsd={product.pricing.export_price_usd}
              weightGrams={product.logistics.weight_grams}
              boxLength={product.logistics.dimensions_cm.length}
              boxWidth={product.logistics.dimensions_cm.width}
              boxHeight={product.logistics.dimensions_cm.height}
              isFragile={product.logistics.is_fragile}
              onChange={(updates) => {
                setProduct({
                  ...product,
                  channels: {
                    is_d2c: updates.isD2c ?? product.channels.is_d2c,
                    is_b2b: updates.isB2b ?? product.channels.is_b2b,
                    is_export: updates.isExport ?? product.channels.is_export,
                  },
                  pricing: {
                    ...product.pricing,
                    retail_price_inr: updates.retailPriceInr ?? product.pricing.retail_price_inr,
                    wholesale_price_inr: updates.wholesalePriceInr ?? product.pricing.wholesale_price_inr,
                    b2b_moq: updates.b2bMoq ?? product.pricing.b2b_moq,
                    export_price_usd: updates.exportPriceUsd ?? product.pricing.export_price_usd,
                  },
                  logistics: {
                    ...product.logistics,
                    weight_grams: updates.weightGrams ?? product.logistics.weight_grams,
                    dimensions_cm: {
                      length: updates.boxLength ?? product.logistics.dimensions_cm.length,
                      width: updates.boxWidth ?? product.logistics.dimensions_cm.width,
                      height: updates.boxHeight ?? product.logistics.dimensions_cm.height,
                    },
                    is_fragile: updates.isFragile ?? product.logistics.is_fragile,
                  },
                });
              }}
            />

            {/* Save Action Button */}
            <TouchableOpacity
              onPress={handleSaveChanges}
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              <Save size={18} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.saveBtnText}>
                {isSaving ? t('saving_changes') : t('save_changes')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
    gap: 6,
  },
  retryBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  contentBlock: {
    gap: 16,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  deleteHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  deleteHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleHi: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  titleEn: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE9DF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  hsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  hsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
    marginTop: 10,
  },
  saveBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
