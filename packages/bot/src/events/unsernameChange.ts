import { Events, GuildMember } from 'discord.js';
import {
  getSubscriptionIdsByUsername,
  updateSubscriptionsCommunityUserId,
} from '../api/wordpress.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.GuildMemberUpdate,
  execute: async (before: GuildMember, after: GuildMember) => {
    const beforeUsername = before.user.username;
    const afterUsername = after.user.username;

    // Ignore non-username changes.
    if (beforeUsername === afterUsername) {
      return;
    }

    // Ignore bot username changes.
    if (before.client.user.username === beforeUsername) {
      return;
    }

    console.info(
      `Changing subscription username from ${beforeUsername} to ${afterUsername}`,
    );

    const subscriptionIds = await getSubscriptionIdsByUsername(
      before.user.username,
    );

    if (!subscriptionIds.length) {
      console.warn(`No subscriptions found for ${beforeUsername}.`);
      return;
    }

    try {
      await updateSubscriptionsCommunityUserId(
        subscriptionIds,
        after.user.username,
      );

      console.info(
        `Username changed from ${beforeUsername} to ${afterUsername} for subscriptions`,
        subscriptionIds,
      );
    } catch (ex) {
      // Remove all roles from the user to force re-verification.
      after.roles.set([]);

      console.info(
        `Failed to update subscriptions for ${afterUsername}. Removing all roles.`,
        subscriptionIds,
      );
    }
  },
};

export default event;
