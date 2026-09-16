import axios from 'axios';
import { env } from '@/shared/config/env';

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});
