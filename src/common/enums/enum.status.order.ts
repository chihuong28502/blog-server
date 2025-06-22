export enum OrderStatusEnum {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethodEnum {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  COD = 'cod',
  EWALLET = 'e-wallet',
}
