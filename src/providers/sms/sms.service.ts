import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  sendSms(
    username: string,
    password: string,
    to: string,
    senderId: string,
    message: string,
    refId: string,
    maxsplit: number
  ) {
    return axios.get(
      `https://api.smsbroadcast.com.au/api-adv.php?username=${username}&password=${password}&to=${to}&from=${senderId}&message=${encodeURIComponent(
        message
      )}&ref=${refId}&maxsplit=${maxsplit}`
    );
  }

  async fetchSmsCredits(username: string, password: string) {
    const result = await axios.get(
      `https://api.smsbroadcast.com.au/api-adv.php?action=balance&username=${username}&password=${password}`
    );

    if (result.data && result.data.includes('OK:')) {
      return result.data.replace('OK:', '');
    } else {
      return 0;
    }
  }
}
