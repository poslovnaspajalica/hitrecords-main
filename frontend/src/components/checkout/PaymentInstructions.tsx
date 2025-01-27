import React from 'react';

export interface Props {
  instructions: PaymentInstructions;
  onClose?: () => void;
}

export interface PaymentInstructions {
  amount: number;
  currency: string;
  bankAccount: string;
  bankName: string;
  recipient: string;
  referenceNumber: string;
  description: string;
}

export const PaymentInstructions: React.FC<Props> = ({ instructions, onClose }) => {
  if (!instructions) {
    return <div data-testid="loading-spinner">Loading...</div>;
  }

  return (
    <div className="payment-instructions">
      <h3>Upute za plaćanje</h3>
      <div className="instructions-content">
        <div className="instruction-row">
          <span>Iznos:</span>
          <strong>{instructions.amount} {instructions.currency}</strong>
        </div>
        <div className="instruction-row">
          <span>IBAN:</span>
          <strong>{instructions.bankAccount}</strong>
        </div>
        <div className="instruction-row">
          <span>Banka:</span>
          <strong>{instructions.bankName}</strong>
        </div>
        <div className="instruction-row">
          <span>Primatelj:</span>
          <strong>{instructions.recipient}</strong>
        </div>
        <div className="instruction-row">
          <span>Poziv na broj:</span>
          <strong>{instructions.referenceNumber}</strong>
        </div>
        <div className="instruction-row">
          <span>Opis plaćanja:</span>
          <strong>{instructions.description}</strong>
        </div>
      </div>
      <div className="instructions-footer">
        <p className="note">
          Nakon izvršene uplate, obrada može potrajati do 24 sata.
          Upute za plaćanje poslane su i na vašu email adresu.
        </p>
        {onClose && (
          <button onClick={onClose} className="btn btn-primary">
            Zatvori
          </button>
        )}
      </div>
    </div>
  );
}; 