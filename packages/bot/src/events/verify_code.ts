import { Events, Interaction, ModalSubmitInteraction } from 'discord.js';
import {
  getActiveSubscriptionsByKey,
  updateSubscriptionsCommunityUser,
} from '../api/wordpress.js';
import { ROLE_BY_SKU } from '../models.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'subscriptionKeyModal') return;

    const subscriptionKey = interaction.fields.getTextInputValue(
      'subscriptionKeyInput',
    );

    await interaction.deferReply({ ephemeral: true });

    const subscriptions = await getActiveSubscriptionsByKey(subscriptionKey);

    if (subscriptions.length === 0) {
      console.warn(
        `Subscription for ${interaction.user.username} not verified.`,
      );
      await interaction.followUp({
        content: `Your subscription **could not** be verified.`,
      });
      return;
    }

    const subcription = subscriptions[0];
    const subscriptionId = subcription.id;
    const subscriptionName = subcription.name;
    const subcriptionSku = subcription.sku;

    await updateSubscriptionsCommunityUser([subscriptionId], {
      userId: interaction.user.id,
      username: interaction.user.username,
    });

    await setUserRoleBySku(interaction, subcriptionSku);

    await interaction.followUp({
      content: `Your subscription to **${subscriptionName}** was verified successfully!`,
    });
    console.info(
      `Subscription for ${interaction.user.username} verified via subscription ${subscriptionId}, sku ${subcriptionSku}.`,
    );
  },
};

async function setUserRoleBySku(
  interaction: ModalSubmitInteraction,
  sku: string,
) {
  const role = ROLE_BY_SKU[sku];
  if (!role) {
    return;
  }

  interaction.guild?.members.addRole({
    user: interaction.user,
    role,
  });
}

export default event;
