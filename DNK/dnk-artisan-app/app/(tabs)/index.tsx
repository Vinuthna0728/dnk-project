import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HeaderBanner } from '../../components/HeaderBanner';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function HomeScreen() {
  const { t, profile } = useLanguageStore();
  const router = useRouter();

  const serviceCards = [
    {
      id: 'add_product',
      title: t('add_product_title'),
      sub: t('add_product_sub'),
      icon: '➕',
      bgColor: '#0B7B3E', // India Post Green
      route: '/(tabs)/voice-catalog',
    },
    {
      id: 'dropoff_labels',
      title: t('dropoff_labels_title'),
      sub: t('dropoff_labels_sub'),
      icon: '📦',
      bgColor: '#BA3D1D', // India Post Rust Red
      route: '/(tabs)/orders',
    },
    {
      id: 'payout_status',
      title: t('payout_status_title'),
      sub: t('payout_status_sub'),
      icon: '💰',
      bgColor: '#0B7B3E', // India Post Green
      route: '/(tabs)/payouts',
    },
    {
      id: 'escrow_summary',
      title: t('escrow_summary_title'),
      sub: t('escrow_summary_sub'),
      icon: '🛡️',
      bgColor: '#BA3D1D', // India Post Rust Red
      route: '/(tabs)/payouts',
    },
  ];

  return (
    <View style={styles.container}>
      <HeaderBanner userInitials={profile.name ? profile.name.substring(0, 2).toUpperCase() : 'AE'} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridContainer}>
          {serviceCards.map((card) => (
            <View key={card.id} style={styles.cardWrapper}>
              <TouchableOpacity
                onPress={() => router.push(card.route as any)}
                style={[styles.card, { backgroundColor: card.bgColor }]}
                activeOpacity={0.85}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{card.icon}</Text>
                </View>

                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSub}>{card.sub}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  scrollContent: {
    padding: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  cardWrapper: {
    width: '33.333%',
    padding: 8,
    minWidth: 280,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    height: 96,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  cardSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});
