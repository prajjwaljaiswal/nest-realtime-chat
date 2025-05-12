import { Injectable } from '@nestjs/common';
import axios from 'axios';
import flutterwave from 'flutterwave-node-v3';
import { CheckoutPayload } from './interface';

const API_URL = 'https://api.flutterwave.com/v3';

@Injectable()
export class FlutterWaveService {
  private flw;
  constructor() {
    this.flw = new flutterwave(
      process.env.FLW_PUBLIC_KEY,
      process.env.FLW_SECRET_KEY
    );
  }

  async checkout(payload: CheckoutPayload) {
    try {
      const response = await axios.post(
        `${API_URL}/payments`,
        {
          ...payload,
          currency: 'NGN',
          redirect_url: `${process.env.CLIENT_URL}payment-callback`,
          customizations: {
            title: 'Flutterwave Standard Payment',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const { status, message, data } = response.data;
      if (status === 'success') {
        return data;
      }
      throw message;
    } catch (error) {
      throw error;
    }
  }

  async verifyTransaction(transaction_id: string) {
    return this.flw.Transaction.verify({ id: transaction_id });
  }
}
