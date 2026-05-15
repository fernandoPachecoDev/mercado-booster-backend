import 'dotenv/config';

export const env = {
  port: process.env.PORT || 3000,
  meli: {
    clientId: process.env.MELI_CLIENT_ID || '',
    clientSecret: process.env.MELI_CLIENT_SECRET || '',
    redirectUri: process.env.VITE_MELI_REDIRECT_URI || '',
  }
};