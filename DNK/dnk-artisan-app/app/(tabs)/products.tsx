import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { HeaderBanner } from '../../components/HeaderBanner';
import { ProductItem, SupportedLanguage, useLanguageStore } from '../../store/useLanguageStore';
import { fetchProducts, deleteProduct as apiDeleteProduct } from '../../services/api';

function resolveProductImage(rawUri: string | undefined, title: string, id: number | string): string {
    const t = (title || '').toLowerCase();
    const sid = String(id);
    
    if (sid === '1' || t.includes('peacock') || t.includes('diya') || t.includes('lamp')) {
        return 'http://localhost:3000/diya.png';
    }
    if (sid === '3' || t.includes('toy') || t.includes('wooden') || t.includes('channapatna')) {
        return 'http://localhost:3000/toys.png';
    }
    if (sid === '4' || t.includes('pottery') || t.includes('vase') || t.includes('ceramic') || t.includes('blue pottery')) {
        return 'http://localhost:3000/vase.png';
    }
    if (sid === '5' || t.includes('saree') || t.includes('silk')) {
        return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800';
    }
    if (sid === '6' || t.includes('tea') || t.includes('darjeeling')) {
        return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800';
    }
    if (sid === '8' || t.includes('scarf') || t.includes('kalamkari')) {
        return 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=800';
    }

    if (rawUri && rawUri.startsWith('/')) {
        return `http://localhost:3000${rawUri}`;
    }
    if (rawUri && rawUri.startsWith('http')) {
        return rawUri;
    }
    return 'http://localhost:3000/vase.png';
}

export default function MyProductsScreen() {
    const { t, currentLang, profile, products: localProducts, deleteProduct: localDeleteProduct } = useLanguageStore();
    const router = useRouter();
    const [remoteProducts, setRemoteProducts] = useState<ProductItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        fetchProducts()
            .then((backendProds) => {
                if (!isMounted) return;
                // Filter to display only products belonging to the authenticated artisan
                const myProds = profile.numericId
                    ? backendProds.filter((p) => p.sellerId === profile.numericId)
                    : backendProds;

                const mapped: ProductItem[] = myProds.map((p) => ({
                    id: String(p.id),
                    title: {
                        en: p.title,
                        hi: p.title,
                        kn: p.title,
                        te: p.title,
                        ta: p.title,
                        ml: p.title,
                        mr: p.title,
                        bn: p.title,
                    },
                    description: {
                        en: p.description,
                        hi: p.description,
                        kn: p.description,
                        te: p.description,
                        ta: p.description,
                        ml: p.description,
                        mr: p.description,
                        bn: p.description,
                    },
                    category: 'Handicrafts & Ceramics',
                    hsCode: p.hsCode || '6913.90.00',
                    weight: '1.25 kg',
                    priceInr: p.priceInr,
                    imageUri: resolveProductImage(p.images && p.images.length > 0 ? p.images[0] : undefined, p.title, p.id),
                    status: 'ACTIVE_EXPORT',
                }));
                setRemoteProducts(mapped);
            })
            .catch((_) => {})
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Combine remote products with local Zustand products, de-duplicating by ID
    const combinedProductsMap = new Map<string, ProductItem>();
    remoteProducts.forEach((p) => combinedProductsMap.set(p.id, p));
    localProducts.forEach((p) => combinedProductsMap.set(p.id, p));
    const allProducts = Array.from(combinedProductsMap.values());

    const handleDelete = async (id: string) => {
        const confirmDelete = Platform.OS === 'web' ? window.confirm(t('delete_confirm')) : true;
        if (confirmDelete) {
            localDeleteProduct(id);
            setRemoteProducts((prev) => prev.filter((p) => p.id !== id));
            const numericId = parseInt(id, 10);
            if (!isNaN(numericId)) {
                try {
                    await apiDeleteProduct(numericId);
                } catch (_) {}
            }
        }
    };


    return (
        <View style={styles.container}>
            <HeaderBanner userInitials="KA" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Page Header */}
                <View style={styles.headerBox}>
                    <Text style={styles.titleText}>{t('my_products_title')}</Text>
                    <Text style={styles.subText}>{t('my_products_sub')}</Text>
                </View>

                {/* Product Cards Grid / List */}
                {isLoading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color="#8B2222" />
                        <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading active products from backend...</Text>
                    </View>
                ) : allProducts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>{t('no_products_yet')}</Text>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => router.push('/(tabs)/voice-catalog' as any)}
                        >
                            <Text style={styles.addBtnText}>+ {t('tab_add')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.gridContainer}>
                        {allProducts.map((item) => (
                            <View key={item.id} style={styles.productCard}>
                                <Image source={{ uri: item.imageUri }} style={styles.productImage} resizeMode="cover" />

                                <View style={styles.productDetails}>
                                    <View style={styles.statusRow}>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>✓ {t('active_export_badge')}</Text>
                                        </View>
                                        <Text style={styles.hsCodeText}>HS: {item.hsCode}</Text>
                                    </View>

                                    <Text style={styles.productTitle}>
                                        {item.title[currentLang as SupportedLanguage] || item.title['en']}
                                    </Text>

                                    <Text style={styles.productDesc} numberOfLines={3}>
                                        {item.description[currentLang as SupportedLanguage] || item.description['en']}
                                    </Text>

                                    <View style={styles.bottomRow}>
                                        <View>
                                            <Text style={styles.priceLabel}>ARTISAN PAYOUT</Text>
                                            <Text style={styles.priceValue}>₹{item.priceInr}.00</Text>
                                        </View>

                                        <View style={styles.actionsRow}>
                                            <View style={styles.weightBadge}>
                                                <Text style={styles.weightText}>⚖️ {item.weight}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(item.id)}
                                                style={styles.deleteBtn}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.deleteBtnText}>🗑️ {t('delete_product')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F7' },
    scrollContent: { padding: 20, paddingBottom: 50 },
    headerBox: { marginBottom: 20, alignItems: 'center' },
    titleText: { fontSize: 24, fontWeight: '900', color: '#1F2937' },
    subText: { fontSize: 13, color: '#4B5563', marginTop: 4 },
    emptyState: { backgroundColor: '#FFFFFF', padding: 40, borderRadius: 14, alignItems: 'center', marginTop: 20 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 15, color: '#6B7280', fontWeight: '700', textAlign: 'center', marginBottom: 20 },
    addBtn: { backgroundColor: '#8B2222', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    gridContainer: {
        width: '100%',
        maxWidth: 900,
        alignSelf: 'center',
        gap: 20,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    productImage: { width: '100%', height: 220 },
    productDetails: { padding: 18 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { color: '#166534', fontSize: 10, fontWeight: '800' },
    hsCodeText: { color: '#8B2222', fontSize: 12, fontWeight: '900' },
    productTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937', marginTop: 2 },
    productDesc: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginTop: 6 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 },
    priceLabel: { fontSize: 9, fontWeight: '800', color: '#6B7280' },
    priceValue: { fontSize: 20, fontWeight: '900', color: '#0B7B3E', marginTop: 2 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    weightBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    weightText: { fontSize: 11, fontWeight: '800', color: '#374151' },
    deleteBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5' },
    deleteBtnText: { color: '#DC2626', fontSize: 11, fontWeight: '800' },
});