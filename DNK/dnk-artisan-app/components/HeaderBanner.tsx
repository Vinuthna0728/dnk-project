import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LanguageSelector } from './LanguageSelector';

export function HeaderBanner({ userInitials = "KA" }: { userInitials?: string }) {
  return (
    <View style={styles.headerContainer}>
      {/* 1. TOPMOST LANGUAGE SELECTOR BAR */}
      <LanguageSelector />

      {/* 2. OFFICIAL GOVERNMENT HEADER WITH EMBLEMS & LOGOS */}
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>

          {/* Native Emblem Badge */}
          <View style={styles.emblemBadge}>
            <Text style={styles.emblemText}>🏛️</Text>
            <Text style={styles.emblemSub}>सत्यमेव जयते</Text>
          </View>

          {/* India Post Official Red Box Logo */}
          <View style={styles.postLogoWrapper}>
            <Text style={styles.indiaPostHindi}>भारतीय डाक</Text>
            <Text style={styles.indiaPostEng}>India Post</Text>
          </View>

          {/* Department Info */}
          <View style={styles.deptInfo}>
            <Text style={styles.deptTitle}>Department of Posts</Text>
            <Text style={styles.deptSub}>Ministry of Communications, Govt. of India</Text>
          </View>
        </View>

        {/* Digital India Vector Badge & User Initial Circle */}
        <View style={styles.rightGroup}>
          <View style={styles.digitalIndiaBadge}>
            <Text style={styles.digitalText}>Digital India</Text>
            <Text style={styles.powerText}>Power To Empower</Text>
          </View>

          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{userInitials}</Text>
          </View>
        </View>
      </View>

      {/* 3. OFFICIAL GOLD/YELLOW STRIP */}
      <View style={styles.goldStrip}>
        <Text style={styles.goldStripText}>
          DAK GHAR NIRYAT KENDRA (DNK) — ARTISAN EXPORT PORTAL
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemBadge: {
    alignItems: 'center',
    marginRight: 10,
  },
  emblemText: {
    fontSize: 20,
  },
  emblemSub: {
    fontSize: 6,
    fontWeight: '800',
    color: '#8B2222',
  },
  postLogoWrapper: {
    backgroundColor: '#8B2222',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
  },
  indiaPostHindi: {
    color: '#FFC107',
    fontSize: 8,
    fontWeight: '800',
  },
  indiaPostEng: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 13,
  },
  deptInfo: {
    justifyContent: 'center',
  },
  deptTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2937',
  },
  deptSub: {
    fontSize: 9,
    color: '#4B5563',
    fontWeight: '600',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  digitalIndiaBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
  },
  digitalText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '900',
  },
  powerText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '700',
  },
  userBadge: {
    backgroundColor: '#8B2222',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  goldStrip: {
    backgroundColor: '#FFC107',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  goldStripText: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 11,
    color: '#111827',
    letterSpacing: 0.6,
  },
});