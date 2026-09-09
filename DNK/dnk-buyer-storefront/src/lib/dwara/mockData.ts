// src/lib/mockData.ts
export interface Product {
  id: string;
  title: string;
  artisanName: string;
  location: string;
  hsCode: string;
  priceInr: number;
  priceUsd: number;
  image: string; // Points to image in public/ directory
  dnkFacilityCode: string;
  rating: number;
  reviewsCount: number;
  description: string;
  weightKg: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_882391",
    title: "Handcrafted Brass Peacock Oil Lamp (Diya)",
    artisanName: "Ramesh Kumar",
    location: "Belagavi, Karnataka",
    hsCode: "8306.29.00",
    priceInr: 1200,
    priceUsd: 14.37,
    image: "/diya.png", // 👈 Save your image as public/diya.jpg
    dnkFacilityCode: "DNK-KA-BEL-01",
    rating: 4.9,
    reviewsCount: 38,
    description: "Intricately detailed traditional oil lamp cast in solid brass by master artisans in Belagavi. Ideal for cultural decor and direct postal export.",
    weightKg: 0.85,
  },
  {
    id: "prod_771920",
    title: "Handwoven Blue Pottery Decorative Vase",
    artisanName: "Siddharth Craft Studio",
    location: "Jaipur, Rajasthan",
    hsCode: "6913.90.00",
    priceInr: 1850,
    priceUsd: 22.15,
    image: "/vase.png", // 👈 Save your image as public/vase.jpg
    dnkFacilityCode: "DNK-RJ-JPR-02",
    rating: 4.8,
    reviewsCount: 52,
    description: "Traditional Jaipur blue pottery vase glazed with natural quartz resin and cobalt dyes.",
    weightKg: 1.2,
  },
  {
    id: "prod_551029",
    title: "Handpainted Channapatna Wooden Craft Toys",
    artisanName: "Gowda Toy Collective",
    location: "Ramanagara, Karnataka",
    hsCode: "9503.00.10",
    priceInr: 850,
    priceUsd: 10.18,
    image: "/toys.png", // 👈 Save your image as public/toys.jpg
    dnkFacilityCode: "DNK-KA-RAM-01",
    rating: 5.0,
    reviewsCount: 19,
    description: "Non-toxic, vegetable-dyed wooden craft toys manufactured in Ramanagara's craft cluster.",
    weightKg: 0.45,
  },
];