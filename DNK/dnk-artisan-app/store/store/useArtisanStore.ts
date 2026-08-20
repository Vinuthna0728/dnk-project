import { create } from 'zustand';

export interface ArtisanUser {
  id: string;
  artisanId: string;
  name: string;
  craftType: string;
  phone: string;
  dnkCenter: string;
  pincode: string;
  kycVerified: boolean;
  iecNumber?: string;
  language: string;
  avatarUrl?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export interface DraftProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  suggestedPrice: number;
  weightGrams: number;
  dimensions: ProductDimensions;
  hsCode: string;
  images: string[];
  audioUri?: string;
  transcribedText?: string;
  detectedLanguage?: string;
  materials?: string[];
  status: 'draft' | 'ready_for_dnk' | 'synced';
  createdAt: string;
}

export interface ArtisanOrder {
  id: string;
  consignmentNumber: string;
  buyerName: string;
  destinationCountry: string;
  destinationFlag: string;
  productName: string;
  category: string;
  quantity: number;
  declaredValueINR: number;
  weightGrams: number;
  hsCode: string;
  status: 'pending_packing' | 'label_printed' | 'dropped_at_dnk' | 'customs_cleared' | 'in_transit' | 'delivered';
  labelPrinted: boolean;
  createdDate: string;
  dropOffDeadline: string;
  trackingEvents: Array<{
    timestamp: string;
    location: string;
    description: string;
  }>;
}

export interface ArtisanState {
  // Authentication & Profile
  user: ArtisanUser | null;
  isAuthenticated: boolean;
  activeLanguage: string;

  // Product Catalog Drafts (Module A)
  draftProducts: DraftProduct[];
  isRecordingVoice: boolean;

  // Orders & Shipments (Module B)
  orders: ArtisanOrder[];
  isBluetoothPrinterConnected: boolean;
  connectedPrinterName: string | null;

  // Actions
  login: (userData?: Partial<ArtisanUser>) => void;
  logout: () => void;
  setLanguage: (lang: string) => void;
  setRecordingVoice: (isRecording: boolean) => void;

  // Draft Management
  addDraftProduct: (product: Omit<DraftProduct, 'id' | 'createdAt'>) => DraftProduct;
  updateDraftProduct: (id: string, updates: Partial<DraftProduct>) => void;
  removeDraftProduct: (id: string) => void;
  clearDrafts: () => void;

  // Order & Printer Management
  markLabelPrinted: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: ArtisanOrder['status']) => void;
  setBluetoothPrinterStatus: (connected: boolean, printerName?: string) => void;
}

const DEFAULT_USER: ArtisanUser = {
  id: 'usr_artisan_01',
  artisanId: 'DNK-RJ-2026-9842',
  name: 'Rameshwar Lal Sharma',
  craftType: 'Traditional Blue Pottery & Terracotta',
  phone: '+91 98290 12345',
  dnkCenter: 'Jaipur GPO - Dak Ghar Niryat Kendra',
  pincode: '302001',
  kycVerified: true,
  iecNumber: 'IEC-0518042911',
  language: 'hi',
};

const INITIAL_DRAFTS: DraftProduct[] = [
  {
    id: 'draft_001',
    title: 'Handmade Cobalt Blue Ceramic Floral Vase (10 inch)',
    description: 'Authentic Jaipur Blue Pottery decorative flower vase, quartz powder craft with Mughal hand-painted motifs.',
    category: 'Blue Pottery & Ceramics',
    suggestedPrice: 1650,
    weightGrams: 850,
    dimensions: { length: 12, width: 12, height: 26, unit: 'cm' },
    hsCode: '6913.90',
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400'],
    transcribedText: '10 inch ka blue pottery phool daan, Mughal design, 850 gram vajan, keemat 1650 rupaye.',
    detectedLanguage: 'Hindi',
    materials: ['Quartz stone', 'Raw glaze', 'Natural cobalt dye'],
    status: 'ready_for_dnk',
    createdAt: '2026-08-12T10:30:00Z',
  },
  {
    id: 'draft_002',
    title: 'Hand-carved Sheesham Wood Elephant Figurine',
    description: 'Intricately hand-chiseled Indian rosewood elephant statue with jali lattice work.',
    category: 'Woodcraft & Carving',
    suggestedPrice: 2400,
    weightGrams: 620,
    dimensions: { length: 15, width: 8, height: 12, unit: 'cm' },
    hsCode: '4420.10',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'],
    transcribedText: 'Sheesham ki lakdi ka jali wala haathi, 620 gram, price 2400 rupees.',
    detectedLanguage: 'Hindi',
    materials: ['Sheesham Wood', 'Natural beeswax polish'],
    status: 'draft',
    createdAt: '2026-08-12T14:15:00Z',
  },
];

const INITIAL_ORDERS: ArtisanOrder[] = [
  {
    id: 'ord_101',
    consignmentNumber: 'EK892019482IN',
    buyerName: 'Eleanor Vance',
    destinationCountry: 'United States',
    destinationFlag: '🇺🇸',
    productName: 'Royal Jaipur Blue Pottery Dinner Set (6 Pcs)',
    category: 'Ceramics',
    quantity: 1,
    declaredValueINR: 4800,
    weightGrams: 2100,
    hsCode: '6912.00',
    status: 'pending_packing',
    labelPrinted: false,
    createdDate: '2026-08-11',
    dropOffDeadline: '2026-08-14, 04:00 PM',
    trackingEvents: [
      {
        timestamp: '11 Aug 2026, 09:30 AM',
        location: 'DNK Portal',
        description: 'Electronic customs export declaration generated (PBE-III)',
      },
    ],
  },
  {
    id: 'ord_102',
    consignmentNumber: 'EK892019519IN',
    buyerName: 'Klaus Schmidt',
    destinationCountry: 'Germany',
    destinationFlag: '🇩🇪',
    productName: 'Hand-woven Pashmina Silk Stole - Royal Maroon',
    category: 'Textiles',
    quantity: 2,
    declaredValueINR: 7500,
    weightGrams: 350,
    hsCode: '6214.20',
    status: 'label_printed',
    labelPrinted: true,
    createdDate: '2026-08-10',
    dropOffDeadline: '2026-08-13, 02:00 PM',
    trackingEvents: [
      {
        timestamp: '12 Aug 2026, 08:15 AM',
        location: 'Artisan Workshop',
        description: 'India Post CN23 thermal barcode label printed via Bluetooth',
      },
      {
        timestamp: '10 Aug 2026, 06:20 PM',
        location: 'DNK Portal',
        description: 'Order booked from Etsy International Store',
      },
    ],
  },
  {
    id: 'ord_103',
    consignmentNumber: 'EK892018884IN',
    buyerName: 'Amina Al-Maktoum',
    destinationCountry: 'United Arab Emirates',
    destinationFlag: '🇦🇪',
    productName: 'Brass Hand-Engraved Peacock Oil Lamp (Diya)',
    category: 'Metalcraft',
    quantity: 1,
    declaredValueINR: 3200,
    weightGrams: 1200,
    hsCode: '7419.80',
    status: 'dropped_at_dnk',
    labelPrinted: true,
    createdDate: '2026-08-08',
    dropOffDeadline: '2026-08-10, 05:00 PM',
    trackingEvents: [
      {
        timestamp: '10 Aug 2026, 03:40 PM',
        location: 'Jaipur GPO - Counter 4',
        description: 'Consignment received at Dak Ghar Niryat Kendra counter. Barcode scanned.',
      },
      {
        timestamp: '11 Aug 2026, 11:15 AM',
        location: 'FPO Delhi (Foreign Post Office)',
        description: 'Export customs appraisal completed. Cleared for air uplift.',
      },
    ],
  },
];

export const useArtisanStore = create<ArtisanState>((set) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  activeLanguage: 'hi',

  draftProducts: INITIAL_DRAFTS,
  isRecordingVoice: false,

  orders: INITIAL_ORDERS,
  isBluetoothPrinterConnected: false,
  connectedPrinterName: null,

  login: (userData) =>
    set((state) => ({
      isAuthenticated: true,
      user: {
        ...DEFAULT_USER,
        ...userData,
      },
    })),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),

  setLanguage: (activeLanguage) => set({ activeLanguage }),

  setRecordingVoice: (isRecordingVoice) => set({ isRecordingVoice }),

  addDraftProduct: (productData) => {
    const newDraft: DraftProduct = {
      ...productData,
      id: `draft_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      draftProducts: [newDraft, ...state.draftProducts],
    }));
    return newDraft;
  },

  updateDraftProduct: (id, updates) =>
    set((state) => ({
      draftProducts: state.draftProducts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  removeDraftProduct: (id) =>
    set((state) => ({
      draftProducts: state.draftProducts.filter((p) => p.id !== id),
    })),

  clearDrafts: () => set({ draftProducts: [] }),

  markLabelPrinted: (orderId) =>
    set((state) => ({
      orders: state.orders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              labelPrinted: true,
              status: ord.status === 'pending_packing' ? 'label_printed' : ord.status,
            }
          : ord
      ),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((ord) =>
        ord.id === orderId ? { ...ord, status } : ord
      ),
    })),

  setBluetoothPrinterStatus: (connected, printerName = 'TVS RP-3160 Gold Bluetooth') =>
    set({
      isBluetoothPrinterConnected: connected,
      connectedPrinterName: connected ? printerName : null,
    }),
}));
