import { apiClient } from "./api";

export interface CheckoutPayload {
  channel_type: "D2C_INLAND" | "B2B_INLAND" | "EXPORT_DNK";
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  customer: {
    full_name: string;
    email: string;
    phone: string;
    shipping_address: {
      address_line: string;
      city: string;
      state: string;
      pincode: string;
      country_code: string;
    };
    tax_identifier?: string;
  };
  payment_method: "UPI" | "CARD_STRIPE" | "COD";
}

export interface OrderConfirmation {
  order_id: string;
  tracking_code: string;
  upi_intent_string?: string;
  status: string;
}

export type OrderResponse = OrderConfirmation;

export const submitOrder = async (
  channel: "d2c" | "b2b" | "export",
  payload: CheckoutPayload
): Promise<OrderConfirmation> => {
  const response = await apiClient.post<OrderConfirmation>(`/api/v1/orders/${channel}/checkout`, payload);
  return response.data;
};

export const orderStoreService = {
  submitOrder,
  createOrder: submitOrder,
};

export default orderStoreService;