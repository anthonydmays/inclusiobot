import { Events, Interaction, ModalSubmitInteraction } from 'discord.js';
import {
  getActiveSubscriptionsByKey,
  updateSubscriptionsCommunityUser,
} from '../api/wordpress.js';
import { ROLE_BY_SKU, Subscription } from '../models.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'subscriptionKeyModal') return;

    const { tag, id: userId } = interaction.user;
    const key = interaction.fields.getTextInputValue('subscriptionKeyInput');

    await interaction.deferReply({ ephemeral: true });

    const subscriptions = await getActiveSubscriptionsByKey(key);

    if (subscriptions.length === 0) {
      console.warn(
        `No active subscriptions for ${key} entered by ${tag} (${userId}).`,
      );
      await interaction.followUp({
        content: `**No subscription found.** Please contact support@morganlatimer.com for assistance.`,
      });
      return;
    }

    const subscription = subscriptions[0];

    if (subscription.userId && subscription.userId !== userId) {
      await interaction.followUp({
        content: `Key **already verified** by another user. Please contact support@morganlatimer.com for assistance.`,
      });
      console.warn(
        `Verification denied for username ${tag} with subscription key ${key}: Already verified by ${subscription.username} (${subscription.userId}).`,
      );
      return;
    }

    console.info(
      `Found unverified subscription ${subscription.id} for key ${key}.`,
    );

    await updateSubscriptionsCommunityUser([subscription.id], {
      userId,
      username: tag,
    });

    await assignRole(interaction, subscription, tag);
  },
};

async function assignRole(
  interaction,
  subscription: Subscription,
  tag: string,
) {
  try {
    await setUserRoleBySku(interaction, subscription.sku);

    await interaction.followUp({
      content: `Your subscription to **${subscription.name}** was verified successfully!`,
    });
    console.info(
      `Subscription for ${tag} verified via subscription ${subscription.id}, sku ${subscription.sku} (${subscription.name}).`,
    );
  } catch (ex) {
    await interaction.followUp({
      content: `Your subscription was verified but something went wrong. Please contact support or email support@morganlatimer.com.`,
    });
    console.info(`Subscription for ${tag} failed.`, ex);
  }
}

async function setUserRoleBySku(
  interaction: ModalSubmitInteraction,
  sku: string,
) {
  const role = ROLE_BY_SKU[sku];
  if (!role) {
    return;
  }

  await interaction.guild?.members.addRole({
    user: interaction.user,
    role,
  });
}

export default event;
