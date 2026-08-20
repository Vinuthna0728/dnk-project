import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLanguageStore, SupportedLanguage } from '../store/useLanguageStore';

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
];

export function LanguageSelector() {
    const { currentLang, setLanguage, t } = useLanguageStore();

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('select_lang')}:</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollList}
            >
                {LANGUAGES.map((lang) => {
                    const isActive = currentLang === lang.code;
                    return (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => setLanguage(lang.code)}
                            style={[styles.langChip, isActive && styles.activeChip]}
                        >
                            <Text style={[styles.langText, isActive && styles.activeText]}>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
    },
    scrollList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    langChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    activeChip: {
        backgroundColor: '#8B2222',
        borderColor: '#8B2222',
    },
    langText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#374151',
    },
    activeText: {
        color: '#FFFFFF',
    },
});