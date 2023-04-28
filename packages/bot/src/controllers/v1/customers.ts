import { Client } from 'discord.js';
import express from 'express';
import { getActiveSubscriptionsByCustomerId } from '../../api/wordpress.js';
import { ROLE_BY_SKU } from '../../constants.js';

export const getCustomersApi = (client: Client) => {
  const router = express.Router();

  router.put('/:id/syncMembership', async (req, res) => {
    const customerId = req.params.id;
    console.info(`Syncing membership for ${customerId}.`);

    // Find all the active subscriptions for the customers from WP
    const subscriptions = await getActiveSubscriptionsByCustomerId(customerId);

    if (!subscriptions.length) {
      // No subscriptions? No problem.
      res.sendStatus(200);
      return;
    }

    // Pick the highest SKU level
    const maxSubscription = subscriptions.reduce((max, s) =>
      s.mlc_subscription_sku > max.mlc_subscription_sku ? s : max,
    );

    // Get community id and sku from subscription
    const sku = maxSubscription.mlc_subscription_sku;
    const username = maxSubscription.meta_data.find(
      (m) => m.key === 'mlc_community_user_id',
    )?.value;

    if (!sku || !username) {
      sku &&
        console.warn(
          `Cannot sync; membership for customer ${customerId} not verified yet or verification failed.`,
        );
      res.sendStatus(200);
      return;
    }

    const role = ROLE_BY_SKU[sku];
    if (!role) {
      console.error('Env ROLE_BY_SKU missing mapping for sku ${sku}');
      res.status(500).send(`Role for sku ${sku} not configured.`);
      return;
    }

    const guild = client.guilds.resolve(process.env.DISCORD_GUILD_ID);
    if (!guild) {
      console.error(
        'Env DISCORD_GUILD_ID not found or is not accessible by bot.',
      );
      res.status(500).send('Guild not found.');
      return;
    }

    const member = (await guild.members.search({ query: username })).at(0);
    if (!member) {
      res.sendStatus(200);
      return;
    }

    const discordRole = guild?.roles.resolve(role);
    if (!discordRole) {
      console.error('Env ROLE_BY_SKU contains invalid role ID for sku ${sku}');
      res.status(500).send('Role cannot be assigned: not found.');
      return;
    }

    try {
      // Set role accordingly.
      await member.roles.set([discordRole]);
      console.info(
        `Customer ${customerId} granted ${discordRole.name} role for sku ${sku}.`,
      );
    } catch (ex) {
      console.error(
        'Env ROLE_BY_SKU contains invalid role ID for sku ${sku}',
        ex,
      );
      res
        .status(500)
        .send(
          'Role cannot be assigned: unknown error. ' + (ex as Error).toString(),
        );
      return;
    }

    res.sendStatus(200);
  });

  return router;
};
