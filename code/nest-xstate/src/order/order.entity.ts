export type OrderState = 'created' | 'paid' | 'shipped' | 'finalized';

export type OrderEvent =
  | { type: 'PAY' }
  | { type: 'SHIP' }
  | { type: 'FINALIZE' };

export class Order {
  id: string;
  state: OrderState;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string) {
    this.id = id;
    this.state = 'created';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
