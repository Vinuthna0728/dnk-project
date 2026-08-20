import { create } from 'zustand';

export interface Product {
    id: string;
    title: string;
    description: string;
    category: string;
    hsCode: string;
    weight: string;
    priceInr: number;
    priceUsd: number;
    imageUri: string;
    dateAdded: string;
    status: 'ACTIVE' | 'READY_FOR_EXPORT' | 'DRAFT';
}

interface ProductState {
    products: Product[];
    addProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [
        {
            id: 'PROD-DNK-01',
            title: 'Handcrafted Brass Dancing Nataraja Idol',
            description: 'Traditional lost-wax cast brass idol with intricate antique finish, sculpted by master craftsmen.',
            category: 'Brass Handicrafts',
            hsCode: '8306.29.00',
            weight: '1.2 kg',
            priceInr: 2850,
            priceUsd: 34.50,
            imageUri: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?q=80&w=600&auto=format&fit=crop',
            dateAdded: '13 Aug 2026',
            status: 'READY_FOR_EXPORT',
        },
        {
            id: 'PROD-DNK-02',
            title: 'Traditional Jaipur Blue Pottery Floral Vase',
            description: 'Hand-painted glazed ceramic floral vase crafted with quartz powder and natural mineral colors.',
            category: 'Blue Pottery',
            hsCode: '6913.90.00',
            weight: '850 g',
            priceInr: 1450,
            priceUsd: 17.50,
            imageUri: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=600&auto=format&fit=crop',
            dateAdded: '12 Aug 2026',
            status: 'ACTIVE',
        }
    ],
    addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
    deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) }))
}));