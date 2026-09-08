/**
 * Postal Drop-Off & Geolocation Hub Screen
 * Detects current GPS coordinates using expo-location and queries
 * real backend for the 5 nearest Dak Ghar Niryat Kendra post offices
 * with Lucide vector icons.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  Building2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
} from 'lucide-react-native';
import { AudioPromptButton } from '../../components/common/AudioPromptButton';
import { Header } from '../../components/common/Header';
import { Colors } from '../../constants/Colors';
import {
  DnkCenter,
  GpsCoordinates,
  fetchNearestDnkCenters,
  getCurrentCoordinates,
  openMapsNavigation,
} from '../../services/locationService';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function DnkDropoffScreen() {
  const { t } = useLanguageStore();

  const [coords, setCoords] = useState<GpsCoordinates | null>(null);
  const [centers, setCenters] = useState<DnkCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const locateAndFetchCenters = async () => {
    setIsLoading(true);
    setPermissionError(null);
    setBackendError(null);

    try {
      const currentGps = await getCurrentCoordinates();
      setCoords(currentGps);

      try {
        const nearestList = await fetchNearestDnkCenters(
          currentGps.latitude,
          currentGps.longitude
        );
        setCenters(nearestList);
      } catch (err: any) {
        setBackendError(t('error_connection'));
      }
    } catch (gpsErr: any) {
      setPermissionError(t('permission_denied_desc'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void locateAndFetchCenters();
  }, []);

  const audioGuide = `${t('dropoff_title')}. ${t('dropoff_sub')}`;

  return (
    <View style={styles.container}>
      <Header showAudioHelp={true} audioPromptText={audioGuide} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <View style={styles.titleTextGroup}>
              <View style={styles.titleIconRow}>
                <MapPin size={22} color={Colors.primary} strokeWidth={2.4} />
                <Text style={styles.titleText}>{t('dropoff_title')}</Text>
              </View>
              <Text style={styles.subText}>{t('dropoff_sub')}</Text>
            </View>
            <AudioPromptButton textToSpeak={audioGuide} size={36} />
          </View>
        </View>

        {/* GPS Coordinates Badge */}
        {coords ? (
          <View style={styles.gpsBadge}>
            <Navigation size={14} color={Colors.primary} strokeWidth={2.4} />
            <Text style={styles.gpsBadgeText}>
              {t('gps_status')}: Lat {coords.latitude.toFixed(4)}, Lng {coords.longitude.toFixed(4)}
            </Text>
          </View>
        ) : null}

        {/* PERMISSION DENIED ERROR */}
        {permissionError ? (
          <View style={styles.warningCard}>
            <AlertCircle size={28} color="#92400E" strokeWidth={2.2} />
            <Text style={styles.warningTitle}>{t('permission_denied')}</Text>
            <Text style={styles.warningSub}>{permissionError}</Text>
            <TouchableOpacity
              onPress={locateAndFetchCenters}
              style={styles.retryActionBtn}
              activeOpacity={0.85}
            >
              <RefreshCw size={13} color={Colors.textPrimary} strokeWidth={2.4} />
              <Text style={styles.retryActionBtnText}>{t('btn_retry_gps')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* BACKEND ERROR */}
        {backendError ? (
          <View style={styles.errorCard}>
            <AlertCircle size={28} color="#991B1B" strokeWidth={2.2} />
            <Text style={styles.errorTitle}>{t('error_connection_title')}</Text>
            <Text style={styles.errorSub}>{backendError}</Text>
            <TouchableOpacity
              onPress={locateAndFetchCenters}
              style={styles.retryActionBtn}
              activeOpacity={0.85}
            >
              <RefreshCw size={13} color={Colors.textPrimary} strokeWidth={2.4} />
              <Text style={styles.retryActionBtnText}>{t('btn_retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* LOADING INDICATOR */}
        {isLoading && !permissionError && !backendError ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {t('finding_nearest_centers')}
            </Text>
          </View>
        ) : null}

        {/* CENTERS LIST */}
        {!isLoading && !permissionError && !backendError ? (
          centers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Building2 size={40} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.emptyTitle}>{t('no_centers_title')}</Text>
              <Text style={styles.emptySub}>
                {t('no_centers_sub')}
              </Text>
            </View>
          ) : (
            <View style={styles.centersList}>
              {centers.map((center, index) => (
                <View key={center.id || index} style={styles.centerCard}>
                  <View style={styles.centerHeaderRow}>
                    <View style={styles.centerRankCircle}>
                      <Text style={styles.centerRankText}>#{index + 1}</Text>
                    </View>

                    <View style={styles.centerTitleBlock}>
                      <Text style={styles.centerName}>{center.name}</Text>
                      <Text style={styles.centerPincode}>
                        {t('label_pincode')}: {center.pincode}
                      </Text>
                    </View>

                    {center.distance_km !== undefined ? (
                      <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>
                          {center.distance_km.toFixed(1)} {t('distance_km')}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.centerAddress}>{center.address}</Text>

                  {center.operating_hours ? (
                    <View style={styles.metaRow}>
                      <Clock size={13} color="#6B7280" strokeWidth={2.2} />
                      <Text style={styles.centerHours}>
                        {t('label_hours')}: {center.operating_hours}
                      </Text>
                    </View>
                  ) : null}

                  {center.contact_number ? (
                    <View style={styles.metaRow}>
                      <Phone size={13} color="#6B7280" strokeWidth={2.2} />
                      <Text style={styles.centerContact}>
                        {t('label_contact')}: {center.contact_number}
                      </Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    onPress={() =>
                      openMapsNavigation(
                        center.latitude,
                        center.longitude,
                        center.name
                      )
                    }
                    style={styles.navigateBtn}
                    activeOpacity={0.85}
                  >
                    <Navigation size={16} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.navigateBtnText}>
                      {t('open_maps')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
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
  titleBlock: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleTextGroup: {
    flex: 1,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    gap: 6,
  },
  gpsBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  centersList: {
    gap: 14,
  },
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  centerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  centerRankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRankText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  centerTitleBlock: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  centerPincode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  centerAddress: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  centerHours: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  centerContact: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  navigateBtn: {
    height: 48,
    backgroundColor: '#1B4D3E',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  navigateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 320,
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#92400E',
  },
  warningSub: {
    fontSize: 12,
    color: '#78350F',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#991B1B',
  },
  errorSub: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  retryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
    gap: 6,
  },
  retryActionBtnText: {
    color: Colors.textPrimary,
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
