import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { HeaderBanner } from '../../components/HeaderBanner';
import { useLanguageStore } from '../../store/useLanguageStore';
import { fetchMyEscrows } from '../../services/api';

interface PayoutTransaction {
    id: string;
    orderId: string;
    item: string;
    amountInr: number;
    amountUsd: number;
    date: string;
    status: 'COMPLETED' | 'ESCROW_HELD';
    utrNumber: string;
}

export default function PayoutsScreen() {
    const { t, profile } = useLanguageStore();
    const [liveEscrows, setLiveEscrows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        fetchMyEscrows()
            .then((escrows) => {
                if (!isMounted) return;
                setLiveEscrows(escrows || []);
            })
            .catch((_) => {})
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const dynamicEscrowLocked = liveEscrows
        .filter((e) => e.status === 'FUNDS_HELD_ESCROW' || e.status === 'CREATED')
        .reduce((sum, e) => sum + Number(e.amount_inr || 0), 0);

    const dynamicWithdrawn = liveEscrows
        .filter((e) => e.status === 'RELEASED_TO_SELLER_BANK')
        .reduce((sum, e) => sum + Number(e.amount_inr || 0), 0);

    const totalEscrowLocked = dynamicEscrowLocked;
    const totalWithdrawn = dynamicWithdrawn;

    const transactions: PayoutTransaction[] = liveEscrows.map((e) => ({
        id: `TXN-${e.id}`,
        orderId: `ORD-2026-${e.order_id || e.id}`,
        item: `Export Craft Order #${e.order_id || e.id}`,
        amountInr: Number(e.amount_inr || 0),
        amountUsd: Number(((Number(e.amount_inr || 0)) / 83.5).toFixed(2)),
        date: e.updated_at ? new Date(e.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
        status: e.status === 'RELEASED_TO_SELLER_BANK' ? 'COMPLETED' : 'ESCROW_HELD',
        utrNumber: e.status === 'RELEASED_TO_SELLER_BANK' ? (e.payout_reference || `IPOS2026${String(e.id).padStart(6, '0')}`) : 'HELD_UNTIL_COUNTER_SCAN',
    }));

    return (
        <View style={styles.container}>
            <HeaderBanner userInitials={profile.name ? profile.name.substring(0, 2).toUpperCase() : 'KA'} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Page Header */}
                <View style={styles.headerBox}>
                    <Text style={styles.titleText}>{t('payouts_screen_title')}</Text>
                    <Text style={styles.subText}>{t('payouts_screen_sub')}</Text>
                </View>

                <View style={styles.contentWrapper}>
                    {/* 1. ESCROW VAULT HERO SUMMARY CARD */}
                    <View style={styles.escrowCard}>
                        <View style={styles.escrowHeader}>
                            <View>
                                <Text style={styles.escrowLabel}>{t('escrow_locked_title')}</Text>
                                <Text style={styles.escrowAmount}>₹{totalEscrowLocked.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            </View>
                            <View style={styles.escrowShield}>
                                <Text style={styles.shieldIcon}>🛡️</Text>
                            </View>
                        </View>
                        <Text style={styles.escrowSubText}>{t('escrow_locked_sub')}</Text>

                        <View style={styles.bankLinkRow}>
                            <Text style={styles.bankInfoText}>
                                Payout Account: <Text style={styles.bankBold}>{profile.bankAccount || 'Not configured'}</Text> ({profile.ifscCode})
                            </Text>
                        </View>
                    </View>

                    {/* 2. STATS OVERVIEW ROW */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>TOTAL WITHDRAWN (INR)</Text>
                            <Text style={styles.statValueGreen}>₹{totalWithdrawn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>PAYOUT FREQUENCY</Text>
                            <Text style={styles.statValue}>Instant on DNK Scan</Text>
                        </View>
                    </View>

                    {/* 3. TRANSACTION HISTORY */}
                    <Text style={styles.sectionHeading}>{t('payout_history_title')}</Text>

                    {isLoading ? (
                        <View style={styles.emptyBox}>
                            <ActivityIndicator size="large" color="#8B2222" />
                            <Text style={styles.loadingText}>Loading escrow records...</Text>
                        </View>
                    ) : transactions.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyIcon}>💰</Text>
                            <Text style={styles.emptyTitle}>No transactions yet</Text>
                            <Text style={styles.emptySubText}>
                                Your escrow releases and bank payouts will appear here upon postal drop-off scan.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.txList}>
                            {transactions.map((tx) => (
                                <View key={tx.id} style={styles.txCard}>
                                    <View style={styles.txLeft}>
                                        <Text style={styles.txItemTitle}>{tx.item}</Text>
                                        <Text style={styles.txMeta}>{tx.orderId} • {tx.date}</Text>
                                        <Text style={styles.txUtr}>UTR: {tx.utrNumber}</Text>
                                    </View>

                                    <View style={styles.txRight}>
                                        <Text style={styles.txAmount}>+₹{tx.amountInr.toLocaleString()}.00</Text>
                                        <Text style={styles.txUsd}>(${tx.amountUsd.toFixed(2)} USD)</Text>
                                        <View style={tx.status === 'COMPLETED' ? styles.badgeSuccess : styles.badgeHeld}>
                                            <Text style={tx.status === 'COMPLETED' ? styles.badgeTextSuccess : styles.badgeTextHeld}>
                                                {tx.status === 'COMPLETED' ? '✅ Bank Transferred' : '🔒 Escrow Locked'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F7' },
    scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 50 },
    headerBox: { marginBottom: 20, alignItems: 'center' },
    titleText: { fontSize: 24, fontWeight: '900', color: '#1F2937' },
    subText: { fontSize: 13, color: '#4B5563', marginTop: 4, textAlign: 'center' },
    contentWrapper: { width: '100%', maxWidth: 760 },

    // Escrow Vault Card
    escrowCard: {
        backgroundColor: '#8B2222',
        borderRadius: 16,
        padding: 22,
        shadowColor: '#8B2222',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 16,
    },
    escrowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    escrowLabel: { color: '#FFD54F', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    escrowAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginTop: 4 },
    escrowShield: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
    shieldIcon: { fontSize: 26 },
    escrowSubText: { color: '#F3F4F6', fontSize: 12, marginTop: 8 },
    bankLinkRow: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' },
    bankInfoText: { color: '#FFD54F', fontSize: 11 },
    bankBold: { color: '#FFFFFF', fontWeight: '800' },

    // Stats Row
    statsRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
    statBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statLabel: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
    statValueGreen: { fontSize: 18, fontWeight: '900', color: '#0B7B3E', marginTop: 4 },
    statValue: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginTop: 4 },

    sectionHeading: { fontSize: 17, fontWeight: '900', color: '#1F2937', marginBottom: 12 },
    emptyBox: {
        backgroundColor: '#FFFFFF',
        padding: 40,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 6 },
    emptySubText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
    loadingText: { fontSize: 14, color: '#6B7280', fontWeight: '700', marginTop: 12 },

    txList: { gap: 12 },
    txCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    txLeft: { flex: 1, paddingRight: 10 },
    txItemTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
    txMeta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
    txUtr: { fontSize: 10, color: '#9CA3AF', marginTop: 4, fontWeight: '600' },
    txRight: { alignItems: 'flex-end' },
    txAmount: { fontSize: 16, fontWeight: '900', color: '#0B7B3E' },
    txUsd: { fontSize: 10, color: '#6B7280', marginTop: 1 },
    badgeSuccess: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
    badgeTextSuccess: { color: '#166534', fontSize: 10, fontWeight: '800' },
    badgeHeld: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
    badgeTextHeld: { color: '#92400E', fontSize: 10, fontWeight: '800' },
});
