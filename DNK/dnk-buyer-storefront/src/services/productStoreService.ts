import { apiClient } from "./api";
import { PublicProductItem } from "@/types/marketplace";

export type { PublicProductItem };

export const fetchD2CProducts = async (): Promise<PublicProductItem[]> => {
  const response = await apiClient.get<PublicProductItem[]>("/api/v1/products/public?channel=d2c");
  return response.data;
};

export const fetchProductById = async (id: string): Promise<PublicProductItem> => {
  const response = await apiClient.get<PublicProductItem>(`/api/v1/products/${id}`);
  return response.data;
};

export const getProductsByChannel = async (channel: string): Promise<PublicProductItem[]> => {
  const channelParam = channel.toLowerCase().replace('_inland', '').replace('_dnk', '');
  const response = await apiClient.get<PublicProductItem[]>(`/api/v1/products/public?channel=${encodeURIComponent(channelParam)}`);
  return response.data;
};

export const getProductById = fetchProductById;

export const productStoreService = {
  fetchD2CProducts,
  fetchProductById,
  getProductById,
  getProductsByChannel,
};

export default productStoreService;
