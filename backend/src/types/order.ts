export interface OrderSummary {
  id: string;
  status: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  trackingNumber?: string;
} 