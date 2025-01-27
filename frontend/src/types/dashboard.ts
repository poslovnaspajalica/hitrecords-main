export interface SalesData {
  date: string;
  amount: number;
  orders: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesData: SalesData[];
} 