import { Injectable } from '@nestjs/common';
import axios from 'axios';

axios.interceptors.request.use(
  (config: any) => {
    config.metadata = { startExecutionTime: new Date() };
    return config;
  },
  (error) =>
    // Do something with request error
    Promise.reject(error)
);

axios.interceptors.response.use(
  (response: any) => {
    response.config.metadata.endExecutionTime = new Date();
    response.executionDuration =
      response.config.metadata.endExecutionTime -
      response.config.metadata.startExecutionTime;
    return response;
  },
  function (error) {
    error.config.metadata.endExecutionTime = new Date();
    error.executionDuration =
      error.config.metadata.endExecutionTime -
      error.config.metadata.startExecutionTime;
    return Promise.reject(error);
  }
);

interface API {
  (
    url: string,
    method?: string,
    options?: {
      data?: unknown;
      responseType?: string;
      headers?: {
        language?: string;
        'Content-Type'?: string;
        Authorization?: string;
        sessionId?: string;
      };
    }
  ): unknown;
}

interface AxiosRequestConfig {
  url: string;
  method: string;
  data?: any;
  timeout?: number;
  headers?: {
    language?: string;
    'Content-Type'?: string;
    Authorization?: string;
    sessionId?: string;
  };
}

@Injectable()
export class HttpService {
  api: API = async (url, method = 'GET', options = {}) => {
    const lang = 'en';
    const token = 'en';

    let config: AxiosRequestConfig = {
      url,
      method: method || 'GET',
      timeout: 30000,
    };

    if (!options.headers) {
      options['headers'] = {
        'Content-Type': 'application/json',
        language: lang as string,
      };
      if (token) {
        options.headers['Authorization'] = token;
      }
    }
    config = { ...config, ...options };
    try {
      const resp = await axios(config);
      return resp.data;
    } catch (e: any) {
      console.log('error', e);
      try {
        if (typeof window !== 'undefined') {
          document.body.style.pointerEvents = 'auto';
        }
        if (e?.response?.data) {
          if (e.response.status === 504) {
            console.log('API services are currently Offline', 'warning');
          }
          if (e.response?.data?.errors?.message === 'jwt expired') {
            console.log('klg-95', 'Logout');
          }
          return e.response.data;
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  };
}
