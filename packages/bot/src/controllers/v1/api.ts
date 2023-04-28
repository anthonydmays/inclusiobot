import { Client } from 'discord.js';
import express from 'express';
import { getCustomersApi } from './customers.js';

export const getApi = (client: Client) => {
  const router = express.Router();
  router.use('/customers', getCustomersApi(client));
  return router;
};
