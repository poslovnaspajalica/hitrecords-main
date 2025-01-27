export function mapShippingToOrderStatus(shippingStatus: string): string | null {
  const statusMap: { [key: string]: string } = {
    'in_transit': 'processing',
    'out_for_delivery': 'shipped',
    'delivered': 'delivered',
    'failed': 'cancelled',
    'returned': 'cancelled'
  };
  return statusMap[shippingStatus.toLowerCase()] || null;
}

export function mapOrderToShippingStatus(orderStatus: string): string | null {
  const statusMap: { [key: string]: string } = {
    'processing': 'in_transit',
    'shipped': 'out_for_delivery',
    'delivered': 'delivered',
    'cancelled': 'cancelled'
  };
  return statusMap[orderStatus.toLowerCase()] || null;
} 