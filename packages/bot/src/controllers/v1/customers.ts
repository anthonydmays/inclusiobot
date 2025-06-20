import { Client } from 'discord.js';
import express from 'express';
import {
  getActiveSubscriptionsByCustomerId,
  getUserIdBySubscriptionId,
} from '../../api/wordpress.js';
import { ROLE_BY_SKU, SPECIAL_ROLE_IDS } from '../../models.js';

export const getCustomersApi = (client: Client) => {
  const router = express.Router();

  router.put('/:id/syncMembership', async (req, res) => {
    const customerId = +req.params.id;
    console.info(`Syncing membership for ${customerId}.`);

    // Find all the active subscriptions for the customers from WP
    const subscriptions = await getActiveSubscriptionsByCustomerId(customerId);

    // Pick the highest SKU level
    const maxSubscription = subscriptions.length
      ? subscriptions.reduce((max, s) => (s.sku > max.sku ? s : max))
      : undefined;

    // Get community id and sku from subscription
    const sku = maxSubscription?.sku;
    let userId = maxSubscription?.userId;

    // If there are no active subscriptions, then use the provided subscription ID to pull a userId.
    if (!userId && req.body?.subscriptionId) {
      userId = await getUserIdBySubscriptionId(req.body.subscriptionId);
    }

    if (!userId) {
      console.warn(
        `Cannot sync. Membership for customer ${customerId} not verified yet or verification failed.`,
      );
      res.status(200).send('Member not verified.');
      return;
    }

    console.info(`Found userId ${userId} for customer ${customerId}.`);

    const guild = client.guilds.resolve(process.env.DISCORD_GUILD_ID);
    if (!guild) {
      console.error(
        'Env DISCORD_GUILD_ID not found or is not accessible by bot.',
      );
      res.status(500).send('Guild not found.');
      return;
    }

    const member = await guild.members.fetch(userId);
    if (!member) {
      console.warn(
        `Cannot sync. Account with userId ${userId} for customer ${customerId} not found in guild.`,
      );
      res.status(422).send(`Customer ${customerId} could not be updated.`);
      return;
    }

    if (!sku) {
      // If the member is in a special role, leave them alone and just exit.
      const isSpecialUser = member.roles.cache.hasAny(...SPECIAL_ROLE_IDS);
      if (isSpecialUser) {
        console.info(`Member ${userId} is special. Not removing roles.`);
        res
          .status(200)
          .send(`Member ${userId} is special. Not removing roles.`);
        return;
      }

      // Remove all roles from members with no subscription.
      await member.roles.set([]);

      console.info(
        `All roles removed for customer ${customerId} with userId ${userId}.`,
      );
      res
        .status(200)
        .send(
          `All roles removed from customer ${customerId} with userId ${userId}.`,
        );
      return;
    }

    const role = ROLE_BY_SKU[sku];
    if (!role) {
      console.error('Env ROLE_BY_SKU missing mapping for sku ${sku}');
      res.status(500).send(`Role for sku ${sku} not configured.`);
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
      console.error('Role cannot be assigned.', ex);
      res
        .status(500)
        .send('Role cannot be assigned. ' + (ex as Error).toString());
      return;
    }

    res.sendStatus(200);
  });

  return router;
};
