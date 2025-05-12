export interface CheckoutPayload {
  tx_ref: string;
  amount: string;
  customer: { [key: string]: any };
}
