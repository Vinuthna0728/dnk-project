/**
 * DNK Artisan 2.0 Catalog Draft Store
 * Multi-step state machine for active product upload wizard
 * with offline draft caching in AsyncStorage and real backend sync.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { APP_CONFIG } from '../constants/Config';
import { CreateProductPayload, createProduct } from '../services/catalogService';

export type WizardStep = 'camera' | 'enhance' | 'voice' | 'review' | 'pricing';
export type SyncStatus = 'local_saved' | 'syncing' | 'synced' | 'sync_failed';

export interface CatalogDraftData {
  id?: string;
  rawImageUri: string | null;
  enhancedImageUri: string | null;
  audioUri: string | null;
  recordedDurationSeconds?: number;

  // Extracted and reviewed attributes
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  category: string;
  material_weave: string;
  estimated_labor_days: number;
  hs_code: string;

  // Omnichannel channels
  is_d2c: boolean;
  is_b2b: boolean;
  is_export: boolean;

  // Pricing
  cost_price_inr: number;
  retail_price_inr: number;
  wholesale_price_inr: number;
  b2b_moq: number;
  export_price_usd: number;

  // Logistics
  weight_grams: number;
  dimensions_cm: {
    length: number;
    width: number;
    height: number;
  };
  is_fragile: boolean;

  lastSavedAt?: string;
}

const INITIAL_DRAFT_DATA: CatalogDraftData = {
  rawImageUri: null,
  enhancedImageUri: null,
  audioUri: null,
  recordedDurationSeconds: 0,
  title_en: '',
  title_hi: '',
  description_en: '',
  description_hi: '',
  category: 'Handicrafts',
  material_weave: '',
  estimated_labor_days: 3,
  hs_code: '6913.90.00',
  is_d2c: true,
  is_b2b: true,
  is_export: true,
  cost_price_inr: 800,
  retail_price_inr: 1500,
  wholesale_price_inr: 1100,
  b2b_moq: 10,
  export_price_usd: 25,
  weight_grams: 500,
  dimensions_cm: {
    length: 20,
    width: 15,
    height: 10,
  },
  is_fragile: false,
};

interface CatalogDraftState {
  currentStep: WizardStep;
  draft: CatalogDraftData;
  syncStatus: SyncStatus;
  syncError: string | null;
  isPublishing: boolean;

  // Actions
  setStep: (step: WizardStep) => void;
  updateDraft: (updates: Partial<CatalogDraftData>) => void;
  saveDraftLocally: () => Promise<void>;
  loadDraftLocally: () => Promise<void>;
  resetDraft: () => Promise<void>;
  publishDraft: () => Promise<boolean>;
}

export const useCatalogDraftStore = create<CatalogDraftState>((set, get) => ({
  currentStep: 'camera',
  draft: INITIAL_DRAFT_DATA,
  syncStatus: 'local_saved',
  syncError: null,
  isPublishing: false,

  setStep: (step: WizardStep) => set({ currentStep: step }),

  updateDraft: (updates: Partial<CatalogDraftData>) => {
    const nextDraft = { ...get().draft, ...updates, lastSavedAt: new Date().toISOString() };
    set({ draft: nextDraft, syncStatus: 'local_saved' });
    void AsyncStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.CATALOG_DRAFT,
      JSON.stringify(nextDraft)
    );
  },

  saveDraftLocally: async () => {
    try {
      const current = get().draft;
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.CATALOG_DRAFT,
        JSON.stringify(current)
      );
      set({ syncStatus: 'local_saved' });
    } catch (err) {
      console.warn('[DraftStore] Failed to save draft locally:', err);
    }
  },

  loadDraftLocally: async () => {
    try {
      const stored = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATALOG_DRAFT);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ draft: { ...INITIAL_DRAFT_DATA, ...parsed } });
      }
    } catch (err) {
      console.warn('[DraftStore] Failed to load draft:', err);
    }
  },

  resetDraft: async () => {
    set({
      currentStep: 'camera',
      draft: INITIAL_DRAFT_DATA,
      syncStatus: 'local_saved',
      syncError: null,
      isPublishing: false,
    });
    try {
      await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.CATALOG_DRAFT);
    } catch (_) {}
  },

  publishDraft: async () => {
    const draft = get().draft;
    set({ isPublishing: true, syncStatus: 'syncing', syncError: null });

    const payload: CreateProductPayload = {
      title_en: draft.title_en.trim() || 'Handcrafted Artisan Product',
      title_hi: draft.title_hi.trim() || draft.title_en.trim() || 'हस्तशिल्प उत्पाद',
      description_en: draft.description_en.trim() || 'Authentic artisan handmade product ready for domestic and global export.',
      description_hi: draft.description_hi.trim() || draft.description_en.trim() || 'पारंपरिक हस्तनिर्मित उत्पाद।',
      category: draft.category || 'Handicrafts',
      hs_code: draft.hs_code || '6913.90.00',
      channels: {
        is_d2c: draft.is_d2c,
        is_b2b: draft.is_b2b,
        is_export: draft.is_export,
      },
      pricing: {
        cost_price_inr: Number(draft.cost_price_inr || 800),
        retail_price_inr: Number(draft.retail_price_inr || 1500),
        wholesale_price_inr: Number(draft.wholesale_price_inr || 1100),
        b2b_moq: Number(draft.b2b_moq || 10),
        export_price_usd: Number(draft.export_price_usd || 25),
      },
      logistics: {
        weight_grams: Number(draft.weight_grams || 500),
        dimensions_cm: {
          length: Number(draft.dimensions_cm.length || 20),
          width: Number(draft.dimensions_cm.width || 15),
          height: Number(draft.dimensions_cm.height || 10),
        },
        is_fragile: Boolean(draft.is_fragile),
      },
      images: {
        raw_url: draft.rawImageUri || '',
        enhanced_url: draft.enhancedImageUri || draft.rawImageUri || '',
      },
    };

    try {
      await createProduct(payload);
      set({ isPublishing: false, syncStatus: 'synced', syncError: null });
      await get().resetDraft();
      return true;
    } catch (err: any) {
      const msg = err?.message || 'उत्पाद प्रकाशित करने में त्रुटि हुई | Publish failed. Draft preserved offline.';
      set({ isPublishing: false, syncStatus: 'sync_failed', syncError: msg });
      return false;
    }
  },
}));

export default useCatalogDraftStore;
