import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

export const CheckoutErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const orderId = searchParams.get('orderId');
  const errorMessage = searchParams.get('error') || 'Nepoznata greška';

  const handleRetry = () => {
    if (!orderId) {
      showToast('Nedostaje ID narudžbe', 'error');
      return;
    }
    window.location.href = `/checkout/retry/${orderId}`;
  };

  return (
    <div className="checkout-error">
      <div className="error-icon">✕</div>
      <h1>Greška pri plaćanju</h1>
      <p className="error-message">{errorMessage}</p>
      
      {orderId && (
        <div className="order-details">
          <p>Broj narudžbe: {orderId}</p>
        </div>
      )}

      <div className="actions">
        <button onClick={handleRetry} className="btn btn-primary">
          Pokušaj ponovno
        </button>
        <Link to="/orders" className="btn btn-secondary">
          Pregledaj narudžbe
        </Link>
        <Link to="/" className="btn btn-link">
          Nastavi kupovinu
        </Link>
      </div>

      <div className="help-text">
        <p>Ako i dalje imate problema s plaćanjem, molimo kontaktirajte našu podršku:</p>
        <p>
          <a href="mailto:support@hitmusic.hr">support@hitmusic.hr</a>
          <br />
          Tel: +385 1 234 5678
        </p>
      </div>
    </div>
  );
}; 