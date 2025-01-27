export interface PaymentListFilters {
  status?: string;
  method?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  description: string;
  code: string;
  is_active: boolean;
  requires_confirmation: boolean;
  config: Record<string, any>;
}

export interface PaymentStats {
  code: string;
  name: string;
  total_count: number;
  completed_count: number;
  total_amount: number;
  avg_completion_time: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
} 