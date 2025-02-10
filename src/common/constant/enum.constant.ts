export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  COMPANY = 'company',
  MANAGER = 'manager',
}

export enum OrderStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum PaymentStatus {
  PENDING = 'pendning',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  UNPAID = 'unpaid',
}

export enum TypeCoupon {
  FIXED = 'fixed',
  PERCENRTAGE = 'percentage',
}
