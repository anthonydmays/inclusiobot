import { Events, Presence } from 'discord.js';
import {
  getAllSubscriptionsByUserId,
  updateSubscriptionsCommunityUser,
} from '../api/wordpress.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.PresenceUpdate,
  execute: async (before: Presence, after: Presence) => {
    const { username, id: userId } = after.user;

    // If the user had a previous status then, they've just awaken. Ignore.
    if (after.status !== 'online' && after.status !== 'offline') {
      return;
    }

    console.info(`Checking username change for ${username} (${userId}).`);

    const subscriptions = await getAllSubscriptionsByUserId(userId);

    if (!subscriptions.length) {
      console.warn(`No subscriptions found for ${username}.`);
      return;
    }

    const subscriptionToUpdate = subscriptions.filter(
      (s) => s.username !== username,
    );
    const subscriptionIds = subscriptionToUpdate.map((s) => s.id);

    // Ignore non-username changes.
    if (!subscriptionToUpdate.length) {
      console.info(`Username not changed.`);
      return;
    }

    const beforeUsername = subscriptionToUpdate[0].username || 'N/A';
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
