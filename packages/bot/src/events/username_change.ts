import { Events, Presence } from 'discord.js';
import {
  getActiveSubscriptionsByUserId,
  updateSubscriptionsCommunityUser,
} from '../api/wordpress.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.PresenceUpdate,
  execute: async (before: Presence, after: Presence) => {
    const { username, id: userId } = after.user;

    // If the user had a previous status then, they've just awaken. Ignore.
    if (before) {
      return;
    }

    console.info(`Checking username change for ${username} (${userId}).`);

    const subscriptions = await getActiveSubscriptionsByUserId(userId);

    if (!subscriptions.length) {
      console.warn(`No subscriptions found for ${username}.`);
      return;
    }

    const subscriptionToUpdate = subscriptions.filter(
      (s) => s.username !== username,
    );
    const subscriptionIds = subscriptions.map((s) => s.id);
    const beforeUsername = subscriptionToUpdate[0].username || 'N/A';

    // Ignore non-username changes.
    if (!subscriptionIds.length) {
      console.info(`Username not changed.`);
      return;
    }

    console.info(
      `Changing subscription username from ${beforeUsername} to ${username}`,
    );

    try {
      await updateSubscriptionsCommunityUser(subscriptionIds, {
        userId: after.user.id,
        username: after.user.username,
      });

      console.info(
        `Username changed from ${beforeUsername} to ${username} for subscriptions`,
        subscriptionIds,
      );
    } catch (ex) {
      console.info(
        `Failed to update subscriptions for ${username}.`,
        subscriptionIds,
      );
    }
  },
};

export default event;
