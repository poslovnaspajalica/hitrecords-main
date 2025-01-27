import pool from '../config/database';
import { addDays, startOfDay, endOfDay, format } from 'date-fns';

interface DeliveryMetrics {
  total: number;
  delivered: number;
  inTransit: number;
  delayed: number;
  cancelled: number;
  avgDeliveryTime: number;
  deliverySuccessRate: number;
}

interface ProviderMetrics {
  providerId: string;
  providerName: string;
  total: number;
  delivered: number;
  delayed: number;
  avgDeliveryTime: number;
}

interface DailyMetrics {
  date: string;
  total: number;
  delivered: number;
  delayed: number;
}

interface LocationMetrics {
  location: string;
  count: number;
  percentage: number;
}

interface IssueMetrics {
  type: string;
  count: number;
  resolved: number;
  avgResolutionTime: number;
}

interface PerformanceMetrics {
  onTimeDeliveries: number;
  onTimePercentage: number;
  avgDeliveryTime: number;
  avgDelayTime: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface DeliveryTimeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export class DashboardService {
  async getDeliveryMetrics(dateFrom?: string, dateTo?: string): Promise<DeliveryMetrics> {
    const connection = await pool.getConnection();
    
    try {
      // Base date filters
      const from = dateFrom ? new Date(dateFrom) : addDays(new Date(), -30);
      const to = dateTo ? new Date(dateTo) : new Date();

      // Get basic metrics
      const [basicMetrics]: any = await connection.query(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN status IN ('in_transit', 'out_for_delivery') THEN 1 ELSE 0 END) as in_transit,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(CASE 
            WHEN status != 'delivered' 
              AND estimated_delivery_date < NOW() 
            THEN 1 
            ELSE 0 
          END) as delayed,
          AVG(CASE 
            WHEN status = 'delivered' 
              AND actual_delivery_date IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, actual_delivery_date)
            ELSE NULL
          END) as avg_delivery_time
        FROM shipments
        WHERE created_at BETWEEN ? AND ?`,
        [startOfDay(from), endOfDay(to)]
      );

      const metrics = basicMetrics[0];
      
      return {
        total: metrics.total,
        delivered: metrics.delivered,
        inTransit: metrics.in_transit,
        delayed: metrics.delayed,
        cancelled: metrics.cancelled,
        avgDeliveryTime: Math.round(metrics.avg_delivery_time || 0),
        deliverySuccessRate: metrics.total > 0 ? 
          (metrics.delivered / metrics.total) * 100 : 0
      };
    } finally {
      connection.release();
    }
  }

  async getProviderMetrics(dateFrom?: string, dateTo?: string): Promise<ProviderMetrics[]> {
    const connection = await pool.getConnection();
    
    try {
      const from = dateFrom ? new Date(dateFrom) : addDays(new Date(), -30);
      const to = dateTo ? new Date(dateTo) : new Date();

      const [metrics]: any = await connection.query(
        `SELECT
          sp.id as provider_id,
          sp.name as provider_name,
          COUNT(*) as total,
          SUM(CASE WHEN s.status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE 
            WHEN s.status != 'delivered' 
              AND s.estimated_delivery_date < NOW() 
            THEN 1 
            ELSE 0 
          END) as delayed,
          AVG(CASE 
            WHEN s.status = 'delivered' 
              AND s.actual_delivery_date IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, s.created_at, s.actual_delivery_date)
            ELSE NULL
          END) as avg_delivery_time
        FROM shipments s
        JOIN shipping_providers sp ON s.provider_id = sp.id
        WHERE s.created_at BETWEEN ? AND ?
        GROUP BY sp.id, sp.name`,
        [startOfDay(from), endOfDay(to)]
      );

      return metrics.map((m: any) => ({
        providerId: m.provider_id,
        providerName: m.provider_name,
        total: m.total,
        delivered: m.delivered,
        delayed: m.delayed,
        avgDeliveryTime: Math.round(m.avg_delivery_time || 0)
      }));
    } finally {
      connection.release();
    }
  }

  async getDailyMetrics(days: number = 7): Promise<DailyMetrics[]> {
    const connection = await pool.getConnection();
    
    try {
      const from = addDays(new Date(), -days);
      
      const [metrics]: any = await connection.query(
        `SELECT
          DATE(created_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE 
            WHEN status != 'delivered' 
              AND estimated_delivery_date < NOW() 
            THEN 1 
            ELSE 0 
          END) as delayed
        FROM shipments
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC`,
        [startOfDay(from)]
      );

      return metrics.map((m: any) => ({
        date: format(m.date, 'yyyy-MM-dd'),
        total: m.total,
        delivered: m.delivered,
        delayed: m.delayed
      }));
    } finally {
      connection.release();
    }
  }

  async getLocationMetrics(dateFrom?: string, dateTo?: string): Promise<LocationMetrics[]> {
    const connection = await pool.getConnection();
    
    try {
      const from = dateFrom ? new Date(dateFrom) : addDays(new Date(), -30);
      const to = dateTo ? new Date(dateTo) : new Date();

      const [results]: any = await connection.query(
        `SELECT 
          ste.location,
          COUNT(*) as count,
          COUNT(*) * 100.0 / (
            SELECT COUNT(DISTINCT shipment_id) 
            FROM shipment_tracking_events 
            WHERE timestamp BETWEEN ? AND ?
          ) as percentage
        FROM shipment_tracking_events ste
        WHERE ste.timestamp BETWEEN ? AND ?
        GROUP BY ste.location
        HAVING ste.location IS NOT NULL AND ste.location != ''
        ORDER BY count DESC
        LIMIT 10`,
        [startOfDay(from), endOfDay(to), startOfDay(from), endOfDay(to)]
      );

      return results.map((r: any) => ({
        location: r.location,
        count: r.count,
        percentage: parseFloat(r.percentage.toFixed(2))
      }));
    } finally {
      connection.release();
    }
  }

  async getIssueMetrics(dateFrom?: string, dateTo?: string): Promise<IssueMetrics[]> {
    const connection = await pool.getConnection();
    
    try {
      const from = dateFrom ? new Date(dateFrom) : addDays(new Date(), -30);
      const to = dateTo ? new Date(dateTo) : new Date();

      const [results]: any = await connection.query(
        `SELECT 
          type,
          COUNT(*) as total_count,
          SUM(CASE WHEN resolved_at IS NOT NULL THEN 1 ELSE 0 END) as resolved_count,
          AVG(
            CASE 
              WHEN resolved_at IS NOT NULL 
              THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at)
              ELSE NULL 
            END
          ) as avg_resolution_time
        FROM shipment_issues
        WHERE created_at BETWEEN ? AND ?
        GROUP BY type`,
        [startOfDay(from), endOfDay(to)]
      );

      return results.map((r: any) => ({
        type: r.type,
        count: r.total_count,
        resolved: r.resolved_count,
        avgResolutionTime: Math.round(r.avg_resolution_time || 0)
      }));
    } finally {
      connection.release();
    }
  }

  async getPerformanceMetrics(dateFrom?: string, dateTo?: string): Promise<PerformanceMetrics> {
    const connection = await pool.getConnection();
    
    try {
      const from = dateFrom ? new Date(dateFrom) : addDays(new Date(), -30);
      const to = dateTo ? new Date(dateTo) : new Date();

      const [results]: any = await connection.query(
        `SELECT 
          COUNT(*) as total_deliveries,
          SUM(
            CASE 
              WHEN status = 'delivered' 
                AND (actual_delivery_date <= estimated_delivery_date 
                  OR estimated_delivery_date IS NULL)
              THEN 1 
              ELSE 0 
            END
          ) as on_time_deliveries,
          AVG(
            CASE 
              WHEN status = 'delivered' 
              THEN TIMESTAMPDIFF(HOUR, created_at, actual_delivery_date)
              ELSE NULL 
            END
          ) as avg_delivery_time,
          AVG(
            CASE 
              WHEN status = 'delivered' 
                AND actual_delivery_date > estimated_delivery_date
              THEN TIMESTAMPDIFF(HOUR, estimated_delivery_date, actual_delivery_date)
              ELSE NULL 
            END
          ) as avg_delay_time
        FROM shipments
        WHERE created_at BETWEEN ? AND ?
          AND status = 'delivered'`,
        [startOfDay(from), endOfDay(to)]
      );

      const metrics = results[0];
      
      return {
        onTimeDeliveries: metrics.on_time_deliveries,
        onTimePercentage: metrics.total_deliveries > 0 ? 
          (metrics.on_time_deliveries / metrics.total_deliveries) * 100 : 0,
        avgDeliveryTime: Math.round(metrics.avg_delivery_time || 0),
        avgDelayTime: Math.round(metrics.avg_delay_time || 0)
      };
    } finally {
      connection.release();
    }
  }

  async getStatusDistribution(dateFrom?: string, dateTo?: string): Promise<StatusDistribution[]> {
    const connection = await pool.getConnection();
    
    try {
      const from = dateFrom ? new Date(dateFrom) : addDays(new Date(), -30);
      const to = dateTo ? new Date(dateTo) : new Date();

      const [results]: any = await connection.query(
        `SELECT 
          status,
          COUNT(*) as count,
          COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM shipments 
            WHERE created_at BETWEEN ? AND ?
          ) as percentage
        FROM shipments
        WHERE created_at BETWEEN ? AND ?
        GROUP BY status`,
        [startOfDay(from), endOfDay(to), startOfDay(from), endOfDay(to)]
      );

      return results.map((r: any) => ({
        status: r.status,
        count: r.count,
        percentage: parseFloat(r.percentage.toFixed(2))
      }));
    } finally {
      connection.release();
    }
  }

  async getDeliveryTimeDistribution(): Promise<DeliveryTimeDistribution[]> {
    const connection = await pool.getConnection();
    
    try {
      const [results]: any = await connection.query(
        `SELECT 
          CASE 
            WHEN delivery_time < 24 THEN '< 24h'
            WHEN delivery_time < 48 THEN '24-48h'
            WHEN delivery_time < 72 THEN '48-72h'
            ELSE '> 72h'
          END as range,
          COUNT(*) as count,
          COUNT(*) * 100.0 / COUNT(*) OVER () as percentage
        FROM (
          SELECT 
            TIMESTAMPDIFF(HOUR, created_at, actual_delivery_date) as delivery_time
          FROM shipments
          WHERE status = 'delivered'
            AND actual_delivery_date IS NOT NULL
        ) as delivery_times
        GROUP BY range
        ORDER BY 
          CASE range
            WHEN '< 24h' THEN 1
            WHEN '24-48h' THEN 2
            WHEN '48-72h' THEN 3
            ELSE 4
          END`
      );

      return results.map((r: any) => ({
        range: r.range,
        count: r.count,
        percentage: parseFloat(r.percentage.toFixed(2))
      }));
    } finally {
      connection.release();
    }
  }

  async getShipmentTrends(days: number = 30): Promise<TimeSeriesData[]> {
    const connection = await pool.getConnection();
    
    try {
      const [results]: any = await connection.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as value
        FROM shipments
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date`,
        [days]
      );

      return results.map((r: any) => ({
        date: format(r.date, 'yyyy-MM-dd'),
        value: r.value
      }));
    } finally {
      connection.release();
    }
  }

  async getDeliveryPerformanceTrends(days: number = 30): Promise<{
    onTime: TimeSeriesData[];
    delayed: TimeSeriesData[];
  }> {
    const connection = await pool.getConnection();
    
    try {
      const [results]: any = await connection.query(
        `SELECT 
          DATE(created_at) as date,
          SUM(CASE 
            WHEN actual_delivery_date <= estimated_delivery_date 
            THEN 1 ELSE 0 
          END) as on_time,
          SUM(CASE 
            WHEN actual_delivery_date > estimated_delivery_date 
            THEN 1 ELSE 0 
          END) as delayed
        FROM shipments
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
          AND status = 'delivered'
        GROUP BY DATE(created_at)
        ORDER BY date`,
        [days]
      );

      return {
        onTime: results.map((r: any) => ({
          date: format(r.date, 'yyyy-MM-dd'),
          value: r.on_time
        })),
        delayed: results.map((r: any) => ({
          date: format(r.date, 'yyyy-MM-dd'),
          value: r.delayed
        }))
      };
    } finally {
      connection.release();
    }
  }
}

export const dashboardService = new DashboardService(); 