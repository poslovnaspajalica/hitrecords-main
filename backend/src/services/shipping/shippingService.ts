import { HPExpressProvider } from './hpExpress';
import { DHLProvider } from './dhl';
import { OverseasProvider } from './overseas';
import { BoxNowProvider } from './boxnow';
// TODO: Import other providers when implemented
import { 
  ShippingProvider, 
  CreateShipmentData, 
  ShipmentResponse,
  TrackingResponse,
  ShippingRate
} from '../../interfaces/shipping';
import pool from '../../config/database';

export class ShippingService {
  private providers: Map<string, ShippingProvider>;

  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  private async initializeProviders() {
    const [providers]: any = await pool.query(
      'SELECT * FROM shipping_providers WHERE is_active = true'
    );

    providers.forEach((provider: any) => {
      switch (provider.code) {
        case 'hp_express':
          this.providers.set(
            provider.code,
            new HPExpressProvider(provider.api_key)
          );
          break;
        case 'dhl':
          this.providers.set(
            provider.code,
            new DHLProvider(provider.api_key, provider.api_secret)
          );
          break;
        case 'overseas':
          this.providers.set(
            provider.code,
            new OverseasProvider(provider.api_key)
          );
          break;
        case 'boxnow':
          this.providers.set(
            provider.code,
            new BoxNowProvider(provider.api_key)
          );
          break;
      }
    });
  }

  async createShipment(
    providerCode: string,
    data: CreateShipmentData
  ): Promise<ShipmentResponse> {
    const provider = this.providers.get(providerCode);
    if (!provider) {
      throw new Error(`Shipping provider ${providerCode} not found`);
    }

    const shipment = await provider.createShipment(data);

    // Save shipment to database
    await pool.query(
      `INSERT INTO shipments (
        id, order_id, provider_id, tracking_number,
        label_url, status, shipping_rate_id,
        estimated_delivery_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shipment.shipmentId,
        data.orderId,
        providerCode,
        shipment.trackingNumber,
        shipment.labelUrl,
        'created',
        data.shippingRateId,
        shipment.estimatedDeliveryDate
      ]
    );

    return shipment;
  }

  async getTracking(
    providerCode: string,
    trackingNumber: string
  ): Promise<TrackingResponse> {
    const provider = this.providers.get(providerCode);
    if (!provider) {
      throw new Error(`Shipping provider ${providerCode} not found`);
    }

    const tracking = await provider.getTracking(trackingNumber);

    // Update shipment status in database
    if (tracking.isDelivered) {
      await pool.query(
        `UPDATE shipments 
         SET status = ?, actual_delivery_date = ?
         WHERE tracking_number = ?`,
        ['delivered', tracking.deliveryDate, trackingNumber]
      );
    }

    return tracking;
  }

  async calculateRates(
    weight: number,
    address: {
      postalCode: string;
      countryCode: string;
    },
    isPickupPoint?: boolean
  ): Promise<ShippingRate[]> {
    const rates: ShippingRate[] = [];

    for (const provider of this.providers.values()) {
      try {
        const providerRates = await provider.calculateRates({
          fromPostalCode: process.env.COMPANY_POSTAL_CODE!,
          toPostalCode: address.postalCode,
          toCountryCode: address.countryCode,
          weight,
          isPickupPoint
        });
        rates.push(...providerRates);
      } catch (error) {
        console.error('Error calculating rates:', error);
      }
    }

    return rates;
  }

  async getBoxNowPickupPoints(postalCode: string) {
    const provider = this.providers.get('boxnow') as BoxNowProvider;
    if (!provider) {
      throw new Error('BoxNow provider not found or not active');
    }
    return provider.getPickupPoints(postalCode);
  }
}

export const shippingService = new ShippingService(); 