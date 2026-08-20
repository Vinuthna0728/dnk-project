import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { HeaderBanner } from '../../components/HeaderBanner';
import { useLanguageStore } from '../../store/useLanguageStore';
import { fetchCurrentUser, updateUserProfile } from '../../services/api';

export default function SettingsScreen() {
    const { t, profile, updateProfile, setProfileFromUser } = useLanguageStore();

    const [name, setName] = useState(profile.name);
    const [mobile, setMobile] = useState(profile.mobile);
    const [craftType, setCraftType] = useState(profile.craftType);
    const [dnkCentre, setDnkCentre] = useState(profile.dnkCentre);
    const [bankAccount, setBankAccount] = useState(profile.bankAccount);
    const [ifscCode, setIfscCode] = useState(profile.ifscCode);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        fetchCurrentUser()
            .then((user) => {
                if (!isMounted || !user) return;
                setProfileFromUser(user);
                if (user.name) setName(user.name);
                if (user.phone) setMobile(user.phone);
                if (user.upi_id) setBankAccount(user.upi_id);
            })
            .catch((_) => {})
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedUser = await updateUserProfile({
                name,
                phone: mobile,
                upi_id: bankAccount,
            });

            if (updatedUser) {
                setProfileFromUser(updatedUser);
            }

            updateProfile({
                name,
                mobile,
                craftType,
                dnkCentre,
                bankAccount,
                ifscCode,
            });

            const successMsg = t('profile_updated');
            if (Platform.OS === 'web') {
                window.alert(successMsg);
            } else {
                Alert.alert("Success", successMsg);
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to update profile on backend database.';
            if (Platform.OS === 'web') {
                window.alert(`Save Error: ${errorMsg}`);
            } else {
                Alert.alert("Save Error", errorMsg);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <HeaderBanner userInitials={profile.name ? profile.name.substring(0, 2).toUpperCase() : 'KA'} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerBox}>
                    <Text style={styles.titleText}>{t('settings_title')}</Text>
                    <Text style={styles.subText}>{t('settings_sub')}</Text>
                </View>

                <View style={styles.card}>
                    {/* Read-Only Assigned DNK Artisan ID */}
                    <View style={styles.idContainer}>
                        <View>
                            <Text style={styles.idLabel}>OFFICIAL DNK ARTISAN ID</Text>
                            <Text style={styles.idValue}>{profile.id}</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✅ Verified</Text>
                        </View>
                    </View>

                    {/* Form Fields */}
                    {isLoading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#8B2222" />
                            <Text style={{ marginTop: 12, color: '#6B7280', fontWeight: '600' }}>Loading profile from backend...</Text>
                        </View>
                    ) : (
                        <View style={styles.formSection}>
                            <Text style={styles.inputLabel}>{t('full_name')}</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.inputField}
                            />

                            <Text style={styles.inputLabel}>{t('mobile_num')}</Text>
                            <TextInput
                                value={mobile}
                                onChangeText={setMobile}
                                style={styles.inputField}
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.inputLabel}>{t('craft_type')}</Text>
                            <TextInput
                                value={craftType}
                                onChangeText={setCraftType}
                                style={styles.inputField}
                            />

                            <Text style={styles.inputLabel}>{t('dnk_centre')}</Text>
                            <TextInput
                                value={dnkCentre}
                                onChangeText={setDnkCentre}
                                style={styles.inputField}
                            />

                            <Text style={styles.inputLabel}>{t('bank_account')}</Text>
                            <TextInput
                                value={bankAccount}
                                onChangeText={setBankAccount}
                                style={styles.inputField}
                            />

                            <Text style={styles.inputLabel}>{t('ifsc_code')}</Text>
                            <TextInput
                                value={ifscCode}
                                onChangeText={setIfscCode}
                                style={styles.inputField}
                                autoCapitalize="characters"
                            />

                            {/* Save Button */}
                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                                disabled={isSaving}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.saveBtnText}>
                                    {isSaving ? 'Saving to Database...' : `💾 ${t('btn_save_changes')}`}
                                </Text>
                            </TouchableOpacity>
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
    card: {
        width: '100%',
        maxWidth: 680,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
    },
    idContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    idLabel: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 0.5 },
    idValue: { fontSize: 18, fontWeight: '900', color: '#8B2222', marginTop: 3 },
    verifiedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    verifiedText: { color: '#166534', fontSize: 11, fontWeight: '800' },
    formSection: { padding: 24 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
    inputField: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        padding: 12,
        borderRadius: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    saveBtn: {
        backgroundColor: '#8B2222',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
});
