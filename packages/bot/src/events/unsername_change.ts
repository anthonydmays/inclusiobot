import { Events, GuildMember } from 'discord.js';
import {
  getSubscriptionIdsByUserId,
  updateSubscriptionsCommunityUser,
} from '../api/wordpress.js';
import { BotEvent } from '../types.js';

// TODO(anthonydmays): Troubleshoot why this isn't working.
const event: BotEvent = {
  name: Events.GuildMemberUpdate,
  execute: async (before: GuildMember, after: GuildMember) => {
    const beforeUsername = before.user.username;
    const afterUsername = after.user.username;

    console.info(`Checking username change for ${afterUsername}.`);

    // Ignore non-username changes.
    if (beforeUsername === afterUsername) {
      console.info(`Username not changed.`);
      return;
    }

    // Ignore bot username changes.
    if (before.client.user.username === beforeUsername) {
      console.info(`Ignoring user changes for bot.`);
      return;
    }

    console.info(
      `Changing subscription username from ${beforeUsername} to ${afterUsername}`,
    );

    const subscriptionIds = await getSubscriptionIdsByUserId(before.user.id);

    if (!subscriptionIds.length) {
      console.warn(
        `No subscriptions found for ${beforeUsername} (${before.user.id}).`,
      );
      return;
    }

    try {
      await updateSubscriptionsCommunityUser(subscriptionIds, {
        userId: after.user.id,
        username: after.user.username,
      });

      console.info(
        `Username changed from ${beforeUsername} to ${afterUsername} for subscriptions`,
        subscriptionIds,
      );
    } catch (ex) {
      console.info(
        `Failed to update subscriptions for ${afterUsername}.`,
        subscriptionIds,
      );
    }
  },
};

export default event;
