import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../hooks/useToast';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    }
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const response = await paymentService.verifyPayment(orderId!);
      setOrderDetails(response);
      setLoading(false);
    } catch (error) {
      showToast('Greška pri provjeri plaćanja', 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Provjera plaćanja...</div>;
  }

  return (
    <div className="checkout-success">
      <div className="success-icon">✓</div>
      <h1>Hvala na narudžbi!</h1>
      <p>Vaša narudžba je uspješno zaprimljena.</p>
      
      {orderDetails && (
        <div className="order-details">
          <h3>Detalji narudžbe</h3>
          <p>Broj narudžbe: {orderId}</p>
          <p>Status: {orderDetails.status}</p>
        </div>
      )}

      <div className="actions">
        <Link to="/orders" className="btn btn-primary">
          Pregledaj narudžbe
        </Link>
        <Link to="/" className="btn btn-secondary">
          Nastavi kupovinu
        </Link>
      </div>
    </div>
  );
}; 