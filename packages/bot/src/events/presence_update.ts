import { Events, Presence } from 'discord.js';
import {
  getAllSubscriptionsByUserId,
  updateSubscriptionsCommunityUser,
} from '../api/wordpress.js';
import { SPECIAL_ROLE_IDS } from '../models.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.PresenceUpdate,
  execute: async (before: Presence, after: Presence) => {
    const { tag, id: userId } = after.user;

    // Ignore bots.
    if (after.user.bot) {
      return;
    }

    // If the user had a previous status then, they've just awaken. Ignore.
    if (after.status !== 'online' && after.status !== 'offline') {
      return;
    }

    console.info(`Checking username change for ${tag} (${userId}).`);

    const subscriptions = await getAllSubscriptionsByUserId(userId);

    if (!subscriptions.some((s) => s.active)) {
      if (!after.member.roles.cache.find((r) => SPECIAL_ROLE_IDS.has(r.id))) {
        await after.member.roles.set([]);

        console.info(`All roles removed for user ${tag} (${userId}).`);
        return;
      }
    }

    if (!subscriptions.length) {
      console.warn(`No subscriptions found for ${tag}.`);
      return;
    }

    const subscriptionToUpdate = subscriptions.filter(
      (s) => s.username !== tag,
    );
    const subscriptionIds = subscriptionToUpdate.map((s) => s.id);

    // Ignore non-username changes.
    if (!subscriptionToUpdate.length) {
      console.info(`Username not changed.`);
      return;
    }

    const beforeTag = subscriptionToUpdate[0].username || 'N/A';
    console.info(`Changing subscription username from ${beforeTag} to ${tag}`);

    try {
      await updateSubscriptionsCommunityUser(subscriptionIds, {
        userId,
        username: tag,
      });

      console.info(
        `Username changed from ${beforeTag} to ${tag} for subscriptions`,
        subscriptionIds,
      );
    } catch (ex) {
      console.info(
        `Failed to update subscriptions for ${tag}.`,
        subscriptionIds,
      );
    }
  },
};

export default event;
