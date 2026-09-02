/**
 * Artisan Dashboard Screen
 * Production-level, real-backend-driven artisan command center:
 * - Real KPI metric cards (Active products, earnings, pending dropoffs, market leads)
 * - Active listings grid / carousel with Lucide iconography
 * - SIH26090 Market Linkage live buyer requirements
 * - Recent orders & quick drop-off QR action
 * - Universal Mobile (360px–430px) & Desktop (768px–1440px) responsiveness.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Coins,
  Handshake,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react-native';
import { AudioPromptButton } from '../../components/common/AudioPromptButton';
import { Header } from '../../components/common/Header';
import { Colors } from '../../constants/Colors';
import { ArtisanProduct, fetchProducts } from '../../services/catalogService';
import { MarketOpportunity, fetchMarketOpportunities } from '../../services/marketService';
import { ArtisanOrder, fetchOrders } from '../../services/orderService';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width >= 1024;

  const [products, setProducts] = useState<ArtisanProduct[]>([]);
  const [orders, setOrders] = useState<ArtisanOrder[]>([]);
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [prodsRes, ordsRes, oppsRes] = await Promise.allSettled([
        fetchProducts(),
        fetchOrders(),
        fetchMarketOpportunities(),
      ]);

      if (prodsRes.status === 'fulfilled') {
        setProducts(prodsRes.value);
      }
      if (ordsRes.status === 'fulfilled') {
        setOrders(ordsRes.value);
      }
      if (oppsRes.status === 'fulfilled') {
        setOpportunities(oppsRes.value);
      }

      if (
        prodsRes.status === 'rejected' &&
        ordsRes.status === 'rejected' &&
        oppsRes.status === 'rejected'
      ) {
        setErrorMessage(t('error_connection'));
      }
    } catch (err: any) {
      setErrorMessage(t('error_connection'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  // Compute Real KPIs
  const activeProductsCount = products.length;
  const totalEarningsInr = orders.reduce((sum, o) => sum + (o.amount_inr || 0), 0);
  const pendingDropoffsCount = orders.filter(
    (o) => o.status === 'PENDING_DROPOFF'
  ).length;
  const marketOppsCount = opportunities.length;

  const greetingName = user?.name || 'Master Artisan';
  const audioGreeting = `${t('greeting_artisan')}, ${greetingName}. ${t('kpi_active_products')}: ${activeProductsCount}. ${t('kpi_total_earnings')}: ₹${totalEarningsInr}. ${t('kpi_pending_dropoff')}: ${pendingDropoffsCount}.`;

  return (
    <View style={styles.container}>
      <Header
        userInitials={user?.name ? user.name.substring(0, 2).toUpperCase() : 'AE'}
        showAudioHelp={true}
        audioPromptText={audioGreeting}
      />

      <ImageBackground
        source={require('../../assets/gov-heritage-bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
        imageStyle={{
          opacity: isDesktop ? 0.35 : 0.22,
        }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO / GREETING ROW */}
        <View style={styles.heroSection}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingTitle}>
              {t('greeting_artisan')}, {greetingName}
            </Text>
            <Text style={styles.greetingSub}>
              DNK ID: DNK-2026-{String(user?.id || '001').padStart(4, '0')} •{' '}
              {user?.dnk_centre || 'Dak Ghar Niryat Kendra'}
            </Text>
          </View>

          <View style={styles.heroAudioRow}>
            <AudioPromptButton
              textToSpeak={audioGreeting}
              size={40}
              label={t('audio_listen')}
            />
          </View>
        </View>

        {/* ERROR STATE WITH RETRY */}
        {errorMessage ? (
          <View style={styles.errorStateCard}>
            <AlertCircle size={28} color="#991B1B" strokeWidth={2.2} />
            <Text style={styles.errorStateTitle}>{t('error_connection_title')}</Text>
            <Text style={styles.errorStateSub}>{errorMessage}</Text>
            <TouchableOpacity
              onPress={loadDashboardData}
              style={styles.retryButton}
              activeOpacity={0.85}
            >
              <RefreshCw size={14} color="#DC2626" strokeWidth={2.4} />
              <Text style={styles.retryButtonText}>{t('btn_retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* LOADING INDICATOR */}
        {isLoading && !errorMessage ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {t('loading')}
            </Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? (
          <>
            {/* KPI STATS ROW */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { borderColor: '#EFE9DF' }]}>
                <View style={[styles.kpiIconCircle, { backgroundColor: '#FDF2F2' }]}>
                  <ShoppingBag size={18} color={Colors.primary} strokeWidth={2.4} />
                </View>
                <Text style={styles.kpiValue}>{activeProductsCount}</Text>
                <Text style={styles.kpiLabel}>{t('kpi_active_products')}</Text>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#EFE9DF' }]}>
                <View style={[styles.kpiIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Coins size={18} color="#166534" strokeWidth={2.4} />
                </View>
                <Text style={[styles.kpiValue, { color: '#166534' }]}>
                  ₹{totalEarningsInr.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.kpiLabel}>{t('kpi_total_earnings')}</Text>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#EFE9DF' }]}>
                <View style={[styles.kpiIconCircle, { backgroundColor: '#FFFBEB' }]}>
                  <Package size={18} color="#B45309" strokeWidth={2.4} />
                </View>
                <Text style={[styles.kpiValue, { color: '#B45309' }]}>
                  {pendingDropoffsCount}
                </Text>
                <Text style={styles.kpiLabel}>{t('kpi_pending_dropoff')}</Text>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#EFE9DF' }]}>
                <View style={[styles.kpiIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Handshake size={18} color="#1E40AF" strokeWidth={2.4} />
                </View>
                <Text style={[styles.kpiValue, { color: '#1E40AF' }]}>
                  {marketOppsCount}
                </Text>
                <Text style={styles.kpiLabel}>{t('kpi_market_leads')}</Text>
              </View>
            </View>

            {/* QUICK ACTIONS BANNER */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/studio' as any)}
                style={[styles.quickActionCard, { backgroundColor: Colors.primary }]}
                activeOpacity={0.85}
              >
                <Sparkles size={26} color="#FFD54F" strokeWidth={2.4} />
                <View style={styles.quickActionTextGroup}>
                  <Text style={styles.quickActionTitleLight}>
                    {t('quick_action_add')}
                  </Text>
                  <Text style={styles.quickActionSubLight}>
                    AI Camera & Voice Onboarding
                  </Text>
                </View>
                <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.6} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/dnk-dropoff' as any)}
                style={[styles.quickActionCard, { backgroundColor: '#1B4D3E' }]}
                activeOpacity={0.85}
              >
                <MapPin size={26} color="#86EFAC" strokeWidth={2.4} />
                <View style={styles.quickActionTextGroup}>
                  <Text style={styles.quickActionTitleLight}>
                    {t('quick_action_dropoff')}
                  </Text>
                  <Text style={styles.quickActionSubLight}>
                    Nearest Post Office GPS
                  </Text>
                </View>
                <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            {/* DESKTOP SPLIT / MOBILE STACK SECTIONS */}
            <View style={[styles.mainSectionsWrapper, isDesktop && styles.desktopRow]}>
              {/* SECTION A: ACTIVE PRODUCTS */}
              <View style={[styles.sectionBlock, isDesktop && styles.sectionHalf]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderTitleRow}>
                    <ShoppingBag size={18} color={Colors.primary} strokeWidth={2.4} />
                    <Text style={styles.sectionTitle}>
                      {t('section_active_catalog')} ({products.length})
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/studio' as any)}
                    style={styles.addSmallBtn}
                    activeOpacity={0.8}
                  >
                    <Plus size={14} color={Colors.primary} strokeWidth={2.6} />
                    <Text style={styles.addSmallBtnText}>{t('add_btn')}</Text>
                  </TouchableOpacity>
                </View>

                {products.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Package size={36} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.emptyTitle}>{t('no_products_title')}</Text>
                    <Text style={styles.emptySub}>{t('no_products_sub')}</Text>
                    <TouchableOpacity
                      onPress={() => router.push('/(tabs)/studio' as any)}
                      style={styles.emptyActionBtn}
                      activeOpacity={0.85}
                    >
                      <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                      <Text style={styles.emptyActionBtnText}>
                        {t('quick_action_add')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.productsList}>
                    {products.slice(0, 4).map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(`/product/${item.id}` as any)}
                        style={styles.productListItem}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{
                            uri:
                              item.images.enhanced_url ||
                              item.images.raw_url ||
                              'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200',
                          }}
                          style={styles.productThumb}
                          resizeMode="cover"
                        />
                        <View style={styles.productInfo}>
                          <Text style={styles.productTitleText} numberOfLines={1}>
                            {item.title_hi || item.title_en}
                          </Text>
                          <Text style={styles.productCategoryText}>
                            {item.category} • HS: {item.hs_code}
                          </Text>
                          <Text style={styles.productPriceText}>
                            ₹{item.pricing.retail_price_inr} • (${item.pricing.export_price_usd} USD)
                          </Text>
                        </View>
                        <ChevronRight size={18} color="#9CA3AF" strokeWidth={2.4} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* SECTION B: SIH26090 MARKET LINKAGE OPPORTUNITIES */}
              <View style={[styles.sectionBlock, isDesktop && styles.sectionHalf]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderTitleRow}>
                    <Handshake size={18} color={Colors.primary} strokeWidth={2.4} />
                    <Text style={styles.sectionTitle}>
                      {t('section_market_opps')}
                    </Text>
                  </View>
                </View>

                {opportunities.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Handshake size={36} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.emptyTitle}>{t('no_opps_title')}</Text>
                    <Text style={styles.emptySub}>{t('no_opps_sub')}</Text>
                  </View>
                ) : (
                  <View style={styles.oppsList}>
                    {opportunities.slice(0, 3).map((opp) => (
                      <View key={opp.id} style={styles.oppCard}>
                        <View style={styles.oppTopRow}>
                          <View style={styles.oppBuyerBlock}>
                            <Text style={styles.oppBuyerName}>
                              {opp.buyer_company}
                            </Text>
                            <Text style={styles.oppCountry}>
                              {opp.buyer_country}
                            </Text>
                          </View>
                          {opp.match_score ? (
                            <View style={styles.matchBadge}>
                              <Text style={styles.matchBadgeText}>
                                {opp.match_score}% Match
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.oppItemTitle}>{opp.item_title}</Text>
                        <Text style={styles.oppSpecs} numberOfLines={2}>
                          {opp.specifications}
                        </Text>

                        <View style={styles.oppBottomRow}>
                          <Text style={styles.oppQuantity}>
                            Qty: {opp.required_quantity} units
                          </Text>
                          {opp.target_price_inr ? (
                            <Text style={styles.oppPrice}>
                              Target: ₹{opp.target_price_inr}/unit
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* SECTION C: RECENT ORDERS */}
            <View style={styles.sectionBlockFull}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderTitleRow}>
                  <Package size={18} color={Colors.primary} strokeWidth={2.4} />
                  <Text style={styles.sectionTitle}>
                    {t('section_recent_orders')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/orders' as any)}
                  style={styles.viewAllRow}
                >
                  <Text style={styles.viewAllText}>{t('view_all')}</Text>
                  <ArrowRight size={14} color={Colors.primary} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {orders.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Package size={36} color="#9CA3AF" strokeWidth={2} />
                  <Text style={styles.emptyTitle}>{t('no_orders_title')}</Text>
                  <Text style={styles.emptySub}>{t('no_orders_sub')}</Text>
                </View>
              ) : (
                <View style={styles.ordersList}>
                  {orders.slice(0, 3).map((ord) => (
                    <View key={ord.id} style={styles.orderSummaryCard}>
                      <View style={styles.orderSummaryLeft}>
                        <Text style={styles.orderSumNumber}>
                          {ord.order_number}
                        </Text>
                        <Text style={styles.orderSumProduct}>
                          {ord.product_title}
                        </Text>
                        <Text style={styles.orderSumDest}>
                          {ord.destination_country} • {ord.tracking_number ? `Tracking: ${ord.tracking_number}` : t('tracking_unavailable')}
                        </Text>
                      </View>
                      <View style={styles.orderSummaryRight}>
                        <Text style={styles.orderSumAmount}>
                          ₹{ord.amount_inr}
                        </Text>
                        <View style={styles.orderStatusPill}>
                          <Text style={styles.orderStatusPillText}>
                            {ord.status === 'SCANNED_AT_DNK'
                              ? t('status_dropped')
                              : ord.status === 'IN_TRANSIT'
                              ? t('status_in_transit')
                              : ord.status === 'DELIVERED'
                              ? t('status_delivered')
                              : t('status_pending')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </ImageBackground>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgImage: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  greetingBlock: {
    flex: 1,
    minWidth: 260,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  heroAudioRow: {
    alignItems: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    gap: 14,
    minHeight: 64,
  },
  quickActionTextGroup: {
    flex: 1,
  },
  quickActionTitleLight: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  quickActionSubLight: {
    color: '#FEF3C7',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  mainSectionsWrapper: {
    gap: 20,
    marginBottom: 24,
  },
  desktopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionHalf: {
    flex: 1,
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionBlockFull: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE9DF',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  productsList: {
    gap: 10,
  },
  productListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE9DF',
    gap: 12,
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  productCategoryText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  productPriceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    marginTop: 2,
  },
  oppsList: {
    gap: 10,
  },
  oppCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE9DF',
  },
  oppTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  oppBuyerBlock: {
    flex: 1,
  },
  oppBuyerName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  oppCountry: {
    fontSize: 11,
    color: '#6B7280',
  },
  matchBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  oppItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  oppSpecs: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 15,
  },
  oppBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
  oppQuantity: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  oppPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  ordersList: {
    gap: 10,
  },
  orderSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE9DF',
    gap: 10,
  },
  orderSummaryLeft: {
    flex: 1,
  },
  orderSumNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  orderSumProduct: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 2,
  },
  orderSumDest: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  orderSummaryRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderSumAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#166534',
  },
  orderStatusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  errorStateCard: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  errorStateTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#991B1B',
  },
  errorStateSub: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'center',
    maxWidth: 360,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
    gap: 6,
  },
  retryButtonText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
});
