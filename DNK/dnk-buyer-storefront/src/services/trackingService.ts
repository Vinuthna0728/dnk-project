import { apiClient } from "./api";

export interface PostalTrackingResponse {
  tracking_code: string;
  order_id: string;
  channel_type: string;
  current_status: "BOOKED" | "CUSTOMS_CLEARED" | "IN_TRANSIT" | "DELIVERED";
  origin_dnk: string;
  destination_hub: string;
  events: Array<{
    timestamp: string;
    location: string;
    status_description: string;
  }>;
}

export const trackingService = {
  getTrackingDetails: async (trackingCode: string): Promise<PostalTrackingResponse> => {
    const response = await apiClient.get<PostalTrackingResponse>(`/api/v1/logistics/track/${trackingCode}`);
    return response.data;
  },
};