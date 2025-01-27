import { Request, Response } from 'express';
import pool from '../config/database';
import { shippingService } from '../services/shipping/shippingService';
import { v4 as uuidv4 } from 'uuid';
import { mapShippingToOrderStatus } from '../utils/statusMapping';
import { exportShipments } from '../utils/exportData';
import { EmailService } from '../services/email/emailService';

// Get all shipping zones
export const getShippingZones = async (_req: Request, res: Response) => {
  try {
    const [zones]: any = await pool.query(
      'SELECT * FROM shipping_zones WHERE is_active = true'
    );
    
    // Za svaku zonu dohvati pripadajuće zemlje
    const zonesWithCountries = await Promise.all(
      zones.map(async (zone: any) => {
        const [countries]: any = await pool.query(
          'SELECT country_code FROM shipping_zone_countries WHERE zone_id = ?',
          [zone.id]
        );
        return {
          ...zone,
          countries: countries.map((c: any) => c.country_code)
        };
      })
    );
    
    res.json(zonesWithCountries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shipping zones' });
  }
};

// Get shipping rates for a specific zone
export const getShippingRates = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const [rates]: any = await pool.query(
      'SELECT * FROM shipping_rates WHERE zone_id = ? AND is_active = true ORDER BY weight_from',
      [zoneId]
    );
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shipping rates' });
  }
};

// Calculate shipping cost
export const calculateShipping = async (req: Request, res: Response) => {
  try {
    const { countryCode, weight } = req.body;

    // 1. Pronađi zonu za državu
    const [zoneResult]: any = await pool.query(
      `SELECT z.* FROM shipping_zones z
       JOIN shipping_zone_countries c ON z.id = c.zone_id
       WHERE c.country_code = ? AND z.is_active = true`,
      [countryCode]
    );

    if (!zoneResult.length) {
      res.status(404).json({ message: 'Shipping not available for this country' });
      return;
    }

    const zoneId = zoneResult[0].id;

    // 2. Pronađi odgovarajuću cijenu za težinu
    const [rateResult]: any = await pool.query(
      `SELECT * FROM shipping_rates 
       WHERE zone_id = ? 
       AND weight_from <= ? 
       AND weight_to >= ?
       AND is_active = true`,
      [zoneId, weight, weight]
    );

    if (!rateResult.length) {
      res.status(404).json({ message: 'No shipping rate found for this weight' });
      return;
    }

    res.json({
      zoneId,
      zoneName: zoneResult[0].name,
      rate: rateResult[0].price,
      weightRange: {
        from: rateResult[0].weight_from,
        to: rateResult[0].weight_to
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating shipping' });
  }
};

// Create new shipping zone (protected)
export const createZone = async (req: Request, res: Response) => {
  try {
    const { name, countries } = req.body;

    // 1. Create zone
    const [zoneResult]: any = await pool.query(
      'INSERT INTO shipping_zones (name) VALUES (?)',
      [name]
    );

    const zoneId = zoneResult.insertId;

    // 2. Add countries
    if (countries && countries.length) {
      const countryValues = countries.map((code: string) => [zoneId, code]);
      await pool.query(
        'INSERT INTO shipping_zone_countries (zone_id, country_code) VALUES ?',
        [countryValues]
      );
    }

    res.status(201).json({
      id: zoneId,
      message: 'Shipping zone created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating shipping zone' });
  }
};

// Update shipping zone (protected)
export const updateZone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, countries } = req.body;

    // 1. Update zone name
    await pool.query(
      'UPDATE shipping_zones SET name = ? WHERE id = ?',
      [name, id]
    );

    // 2. Update countries if provided
    if (countries) {
      // Remove existing countries
      await pool.query(
        'DELETE FROM shipping_zone_countries WHERE zone_id = ?',
        [id]
      );

      // Add new countries
      if (countries.length) {
        const countryValues = countries.map((code: string) => [id, code]);
        await pool.query(
          'INSERT INTO shipping_zone_countries (zone_id, country_code) VALUES ?',
          [countryValues]
        );
      }
    }

    res.json({ message: 'Shipping zone updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shipping zone' });
  }
};

// Delete shipping zone (protected)
export const deleteZone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE shipping_zones SET is_active = false WHERE id = ?',
      [id]
    );

    res.json({ message: 'Shipping zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shipping zone' });
  }
};

// Dodaj shipping rate
export const addShippingRate = async (req: Request, res: Response) => {
  try {
    const { zoneId, weightFrom, weightTo, price } = req.body;

    await pool.query(
      `INSERT INTO shipping_rates 
       (id, zone_id, weight_from, weight_to, price, is_active)
       VALUES (UUID(), ?, ?, ?, ?, true)`,
      [zoneId, weightFrom, weightTo, price]
    );

    res.status(201).json({
      message: 'Shipping rate added successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding shipping rate' });
  }
};

// Get available shipping rates for cart
export const getShippingRatesForCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postalCode, countryCode, isPickupPoint } = req.query;

    if (!postalCode || !countryCode) {
      res.status(400).json({ 
        message: 'Postal code and country code are required' 
      });
      return;
    }

    // Get cart items to calculate total weight
    const [cartItems]: any = await pool.query(
      `SELECT 
        ci.*,
        p.weight
      FROM carts c
      JOIN cart_items ci ON c.id = ci.cart_id
      JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = ?`,
      [userId]
    );

    if (!cartItems.length) {
      res.status(400).json({ message: 'Cart is empty' });
      return;
    }

    // Calculate total weight
    const totalWeight = cartItems.reduce(
      (sum: number, item: any) => sum + (item.weight || 0) * item.quantity,
      0
    );

    // Get shipping rates from all providers
    const rates = await shippingService.calculateRates(
      totalWeight,
      {
        postalCode: postalCode as string,
        countryCode: countryCode as string
      },
      isPickupPoint === 'true'
    );

    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating shipping rates' });
  }
};

// Get BoxNow pickup points
export const getBoxNowPickupPoints = async (req: Request, res: Response) => {
  try {
    const { postalCode } = req.query;

    if (!postalCode) {
      res.status(400).json({ message: 'Postal code is required' });
      return;
    }

    const pickupPoints = await shippingService.getBoxNowPickupPoints(
      postalCode as string
    );

    res.json(pickupPoints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pickup points' });
  }
};

// Get shipping provider settings
export const getShippingProviders = async (_req: Request, res: Response) => {
  try {
    const [providers]: any = await pool.query(
      `SELECT 
        id, 
        name, 
        code,
        is_active,
        settings
      FROM shipping_providers
      WHERE is_active = true`
    );

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shipping providers' });
  }
};

interface ShipmentFilters {
  status?: string;
  provider?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isDelayed?: boolean;
  hasIssues?: boolean;
  estimatedDeliveryFrom?: string;
  estimatedDeliveryTo?: string;
  actualDeliveryFrom?: string;
  actualDeliveryTo?: string;
  priority?: 'high' | 'medium' | 'low';
  weight?: {
    min?: number;
    max?: number;
  };
  price?: {
    min?: number;
    max?: number;
  };
  locations?: string[];
  issueTypes?: string[];
}

interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Admin: Get all shipments with advanced filtering and sorting
export const getAllShipments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Parse filters
    const filters: ShipmentFilters = {
      status: req.query.status as string,
      provider: req.query.provider as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      search: req.query.search as string,
      isDelayed: req.query.isDelayed === 'true',
      hasIssues: req.query.hasIssues === 'true',
      estimatedDeliveryFrom: req.query.estimatedDeliveryFrom as string,
      estimatedDeliveryTo: req.query.estimatedDeliveryTo as string,
      actualDeliveryFrom: req.query.actualDeliveryFrom as string,
      actualDeliveryTo: req.query.actualDeliveryTo as string,
      priority: req.query.priority as 'high' | 'medium' | 'low',
      weight: req.query.weight ? JSON.parse(req.query.weight as string) : undefined,
      price: req.query.price ? JSON.parse(req.query.price as string) : undefined,
      locations: req.query.locations ? JSON.parse(req.query.locations as string) : undefined,
      issueTypes: req.query.issueTypes ? JSON.parse(req.query.issueTypes as string) : undefined
    };

    // Parse sorting
    const sort: SortOptions = {
      field: (req.query.sortField as string) || 'created_at',
      direction: (req.query.sortDir as 'asc' | 'desc') || 'desc'
    };

    // Validate sort field to prevent SQL injection
    const allowedSortFields = [
      'created_at',
      'status',
      'tracking_number',
      'estimated_delivery_date',
      'actual_delivery_date'
    ];

    if (!allowedSortFields.includes(sort.field)) {
      sort.field = 'created_at';
    }

    let query = `
      SELECT 
        s.*,
        o.id as order_id,
        o.status as order_status,
        o.total_amount,
        u.email as customer_email,
        u.first_name,
        u.last_name,
        sp.name as provider_name,
        (
          SELECT JSON_OBJECT(
            'status', ste.status,
            'timestamp', ste.timestamp,
            'location', ste.location,
            'description', ste.description
          )
          FROM shipment_tracking_events ste
          WHERE ste.shipment_id = s.id
          ORDER BY ste.timestamp DESC
          LIMIT 1
        ) as latest_event,
        CASE 
          WHEN s.status != 'delivered' 
            AND s.estimated_delivery_date < NOW() 
          THEN true 
          ELSE false 
        END as is_delayed,
        EXISTS (
          SELECT 1 
          FROM shipment_issues si 
          WHERE si.shipment_id = s.id 
            AND si.resolved_at IS NULL
        ) as has_issues
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN shipping_providers sp ON s.provider_id = sp.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Apply filters
    if (filters.status) {
      query += ` AND s.status = ?`;
      queryParams.push(filters.status);
    }

    if (filters.provider) {
      query += ` AND s.provider_id = ?`;
      queryParams.push(filters.provider);
    }

    if (filters.dateFrom) {
      query += ` AND s.created_at >= ?`;
      queryParams.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      query += ` AND s.created_at <= ?`;
      queryParams.push(filters.dateTo);
    }

    if (filters.search) {
      query += ` AND (
        s.tracking_number LIKE ? OR 
        u.email LIKE ? OR 
        o.id LIKE ? OR
        CONCAT(u.first_name, ' ', u.last_name) LIKE ?
      )`;
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.isDelayed) {
      query += ` AND s.status != 'delivered' AND s.estimated_delivery_date < NOW()`;
    }

    if (filters.hasIssues) {
      query += ` AND EXISTS (
        SELECT 1 
        FROM shipment_issues si 
        WHERE si.shipment_id = s.id 
          AND si.resolved_at IS NULL
      )`;
    }

    // Dodajemo nove filtere u query
    if (filters.estimatedDeliveryFrom) {
      query += ` AND s.estimated_delivery_date >= ?`;
      queryParams.push(filters.estimatedDeliveryFrom);
    }

    if (filters.estimatedDeliveryTo) {
      query += ` AND s.estimated_delivery_date <= ?`;
      queryParams.push(filters.estimatedDeliveryTo);
    }

    if (filters.actualDeliveryFrom) {
      query += ` AND s.actual_delivery_date >= ?`;
      queryParams.push(filters.actualDeliveryFrom);
    }

    if (filters.actualDeliveryTo) {
      query += ` AND s.actual_delivery_date <= ?`;
      queryParams.push(filters.actualDeliveryTo);
    }

    if (filters.priority) {
      query += ` AND s.priority = ?`;
      queryParams.push(filters.priority);
    }

    if (filters.weight) {
      if (filters.weight.min !== undefined) {
        query += ` AND s.weight >= ?`;
        queryParams.push(filters.weight.min);
      }
      if (filters.weight.max !== undefined) {
        query += ` AND s.weight <= ?`;
        queryParams.push(filters.weight.max);
      }
    }

    if (filters.price) {
      if (filters.price.min !== undefined) {
        query += ` AND s.shipping_cost >= ?`;
        queryParams.push(filters.price.min);
      }
      if (filters.price.max !== undefined) {
        query += ` AND s.shipping_cost <= ?`;
        queryParams.push(filters.price.max);
      }
    }

    if (filters.locations && filters.locations.length > 0) {
      query += ` AND EXISTS (
        SELECT 1 
        FROM shipment_tracking_events ste2 
        WHERE ste2.shipment_id = s.id 
          AND ste2.location IN (?)
      )`;
      queryParams.push(filters.locations);
    }

    if (filters.issueTypes && filters.issueTypes.length > 0) {
      query += ` AND EXISTS (
        SELECT 1 
        FROM shipment_issues si 
        WHERE si.shipment_id = s.id 
          AND si.type IN (?)
          AND si.resolved_at IS NULL
      )`;
      queryParams.push(filters.issueTypes);
    }

    // Apply sorting
    query += ` ORDER BY s.${sort.field} ${sort.direction}`;

    // Apply pagination
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [shipments]: any = await pool.query(query, queryParams);

    // Get total count for pagination
    const countQuery = query.replace(
      /SELECT.*?FROM/s,
      'SELECT COUNT(*) as count FROM'
    ).split(' ORDER BY ')[0];

    const [total]: any = await pool.query(
      countQuery,
      queryParams.slice(0, -2)
    );

    res.json({
      shipments: shipments.map((shipment: any) => ({
        ...shipment,
        latest_event: shipment.latest_event ? JSON.parse(shipment.latest_event) : null,
        is_delayed: Boolean(shipment.is_delayed),
        has_issues: Boolean(shipment.has_issues)
      })),
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ message: 'Error fetching shipments' });
  }
};

// Admin: Get shipment details
export const getShipmentDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [shipments]: any = await pool.query(
      `SELECT 
        s.*,
        o.id as order_id,
        o.status as order_status,
        o.total_amount,
        u.email as customer_email,
        u.first_name,
        u.last_name,
        sp.name as provider_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'status', ste.status,
            'timestamp', ste.timestamp,
            'location', ste.location,
            'description', ste.description
          )
        ) as tracking_history
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN shipping_providers sp ON s.provider_id = sp.id
      LEFT JOIN shipment_tracking_events ste ON s.id = ste.shipment_id
      WHERE s.id = ?
      GROUP BY s.id`,
      [id]
    );

    if (!shipments.length) {
      res.status(404).json({ message: 'Shipment not found' });
      return;
    }

    const shipment = shipments[0];
    res.json({
      ...shipment,
      tracking_history: JSON.parse(shipment.tracking_history)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shipment details' });
  }
};

// Admin: Force tracking update
export const updateShipmentTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [shipments]: any = await pool.query(
      'SELECT * FROM shipments WHERE id = ?',
      [id]
    );

    if (!shipments.length) {
      res.status(404).json({ message: 'Shipment not found' });
      return;
    }

    const shipment = shipments[0];
    const tracking = await shippingService.getTracking(
      shipment.provider_id,
      shipment.tracking_number
    );

    // Update tracking info
    await pool.query(
      `UPDATE shipments 
       SET status = ?, 
           actual_delivery_date = ?
       WHERE id = ?`,
      [
        tracking.status,
        tracking.isDelivered ? tracking.deliveryDate : null,
        id
      ]
    );

    // Add new tracking events
    for (const event of tracking.events) {
      await pool.query(
        `INSERT IGNORE INTO shipment_tracking_events 
         (id, shipment_id, status, timestamp, location, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          id,
          event.status,
          event.date,
          event.location,
          event.description
        ]
      );
    }

    res.json({ message: 'Tracking updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating tracking' });
  }
};

// Admin: Bulk update tracking for multiple shipments
export const bulkUpdateTracking = async (req: Request, res: Response) => {
  const { shipmentIds } = req.body;

  if (!Array.isArray(shipmentIds) || !shipmentIds.length) {
    res.status(400).json({ message: 'Shipment IDs array required' });
    return;
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Get all shipments to update
    const [shipments]: any = await connection.query(
      `SELECT 
        s.*,
        o.status as order_status,
        o.user_id,
        u.email,
        u.first_name,
        u.last_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE s.id IN (?)
        AND s.status NOT IN ('delivered', 'cancelled', 'returned')
      GROUP BY s.id`,
      [shipmentIds]
    );

    const results = {
      total: shipmentIds.length,
      updated: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[]
    };

    // Process each shipment in parallel
    await Promise.all(
      shipments.map(async (shipment: any) => {
        try {
          const tracking = await shippingService.getTracking(
            shipment.provider_id,
            shipment.tracking_number
          );

          // If status changed
          if (tracking.status !== shipment.status) {
            // Update shipment status
            await connection.query(
              `UPDATE shipments 
               SET status = ?, 
                   actual_delivery_date = ?
               WHERE id = ?`,
              [
                tracking.status,
                tracking.isDelivered ? tracking.deliveryDate : null,
                shipment.id
              ]
            );

            // Add tracking events
            for (const event of tracking.events) {
              await connection.query(
                `INSERT IGNORE INTO shipment_tracking_events 
                 (id, shipment_id, status, timestamp, location, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  uuidv4(),
                  shipment.id,
                  event.status,
                  event.date,
                  event.location,
                  event.description
                ]
              );
            }

            // Update order status if needed
            const orderStatus = mapShippingToOrderStatus(tracking.status);
            if (orderStatus && orderStatus !== shipment.order_status) {
              await connection.query(
                'UPDATE orders SET status = ? WHERE id = ?',
                [orderStatus, shipment.order_id]
              );

              // Add order status history
              await connection.query(
                `INSERT INTO order_status_history (id, order_id, status, notes)
                 VALUES (?, ?, ?, ?)`,
                [
                  uuidv4(),
                  shipment.order_id,
                  orderStatus,
                  `Automatically updated based on shipping status: ${tracking.status}`
                ]
              );
              // Send email notification 
              await EmailService.send(shipment.email, {
                template: 'order-status-update',
                data: {
                  id: shipment.order_id,
                  status: orderStatus,
                  customerName: `${shipment.first_name} ${shipment.last_name}`,
                  items: JSON.parse(shipment.items),
                  totalAmount: shipment.total_amount,
                  trackingNumber: shipment.tracking_number
                }
              });
            }

            results.updated++;
            results.details.push({
              shipmentId: shipment.id,
              status: 'updated',
              oldStatus: shipment.status,
              newStatus: tracking.status
            });
          } else {
            results.skipped++;
            results.details.push({
              shipmentId: shipment.id,
              status: 'skipped',
              reason: 'No status change'
            });
          }
        } catch (error) {
          results.failed++;
          results.details.push({
            shipmentId: shipment.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      })
    );

    await connection.commit();
    res.json(results);
  } catch (error) {
    await connection.rollback();
    console.error('Bulk tracking update error:', error);
    res.status(500).json({ message: 'Error updating tracking' });
  } finally {
    connection.release();
  }
};

// Admin: Export shipments
export const exportShipmentsData = async (_req: Request, res: Response) => {
  try {
    const { format = 'excel', status, provider, dateFrom, dateTo, search } = _req.query;

    let query = `
      SELECT 
        s.*,
        o.id as order_id,
        o.status as order_status,
        o.total_amount,
        u.email as customer_email,
        u.first_name,
        u.last_name,
        sp.name as provider_name,
        (
          SELECT JSON_OBJECT(
            'status', ste.status,
            'timestamp', ste.timestamp,
            'location', ste.location,
            'description', ste.description
          )
          FROM shipment_tracking_events ste
          WHERE ste.shipment_id = s.id
          ORDER BY ste.timestamp DESC
          LIMIT 1
        ) as latest_event
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN shipping_providers sp ON s.provider_id = sp.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (status) {
      query += ` AND s.status = ?`;
      queryParams.push(status);
    }

    if (provider) {
      query += ` AND s.provider_id = ?`;
      queryParams.push(provider);
    }

    if (dateFrom) {
      query += ` AND s.created_at >= ?`;
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      query += ` AND s.created_at <= ?`;
      queryParams.push(dateTo);
    }

    if (search) {
      query += ` AND (s.tracking_number LIKE ? OR u.email LIKE ? OR o.id LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY s.created_at DESC`;

    const [shipments]: any = await pool.query(query, queryParams);

    const filename = `shipments-export-${new Date().toISOString().split('T')[0]}`;

    await exportShipments(
      shipments.map((s: any) => ({
        ...s,
        latest_event: s.latest_event ? JSON.parse(s.latest_event) : null
      })),
      res,
      {
        format: format === 'csv' ? 'csv' : 'excel',
        filename
      }
    );
  } catch (error) {
    console.error('Error exporting shipments:', error);
    res.status(500).json({ message: 'Error exporting shipments' });
  }
};

// Get filter options
export const getFilterOptions = async (_req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get all statuses
      const [statuses]: any = await connection.query(
        'SELECT DISTINCT status FROM shipments'
      );

      // Get all providers
      const [providers]: any = await connection.query(
        'SELECT id, name FROM shipping_providers WHERE is_active = true'
      );

      // Get all locations
      const [locations]: any = await connection.query(
        'SELECT DISTINCT location FROM shipment_tracking_events WHERE location IS NOT NULL'
      );

      // Get all issue types
      const [issueTypes]: any = await connection.query(
        'SELECT DISTINCT type FROM shipment_issues'
      );

      // Get weight range
      const [weightRange]: any = await connection.query(
        'SELECT MIN(weight) as min, MAX(weight) as max FROM shipments'
      );

      // Get price range
      const [priceRange]: any = await connection.query(
        'SELECT MIN(shipping_cost) as min, MAX(shipping_cost) as max FROM shipments'
      );

      res.json({
        statuses: statuses.map((s: any) => s.status),
        providers: providers.map((p: any) => ({ id: p.id, name: p.name })),
        locations: locations.map((l: any) => l.location),
        issueTypes: issueTypes.map((i: any) => i.type),
        weightRange: weightRange[0],
        priceRange: priceRange[0],
        priorities: ['high', 'medium', 'low']
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Error fetching filter options' });
  }
};

// Update shipping status
export const updateShipmentStatus = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { shipmentId, status } = req.body;

    // Get shipment details
    const [shipments]: any = await connection.query(
      `SELECT 
        s.*,
        o.id as order_id,
        o.status as order_status,
        o.total_amount,
        u.email,
        u.first_name,
        u.last_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE s.id = ?
      GROUP BY s.id`,
      [shipmentId]
    );

    if (!shipments.length) {
      res.status(404).json({ message: 'Shipment not found' });
      return;
    }

    const shipment = shipments[0];

    // Update shipment status
    await connection.query(
      `UPDATE shipments 
       SET status = ?, 
           actual_delivery_date = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        status,
        status === 'delivered' ? new Date() : null,
        shipmentId
      ]
    );

    // Update order status if needed
    const orderStatus = mapShippingToOrderStatus(status);
    if (orderStatus && orderStatus !== shipment.order_status) {
      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [orderStatus, shipment.order_id]
      );

      // Add order status history
      await connection.query(
        `INSERT INTO order_status_history (id, order_id, status, notes)
         VALUES (?, ?, ?, ?)`,
        [
          uuidv4(),
          shipment.order_id,
          orderStatus,
          `Status updated to ${orderStatus} based on shipping status: ${status}`
        ]
      );

      // Send email notification
      await EmailService.send(shipment.email, {
        template: 'order-status-update',
        data: {
          id: shipment.order_id,
          status: orderStatus,
          customerName: `${shipment.first_name} ${shipment.last_name}`,
          items: JSON.parse(shipment.items),
          totalAmount: shipment.total_amount,
          trackingNumber: shipment.tracking_number
        }
      });
    }

    await connection.commit();
    res.json({ status: 'success' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating shipment status:', error);
    res.status(500).json({ message: 'Error updating status' });
  } finally {
    connection.release();
  }
}; 