import {
  ActionRowBuilder,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: 'interactionCreate',
  execute: async (interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'verifyButton') return;

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId('subscriptionKeyModal')
      .setTitle('Provide your community code');

    // Add components to modal

    // Create the text input components
    const subscriptionKeyInput = new TextInputBuilder()
      .setCustomId('subscriptionKeyInput')
      // The label is the prompt the user sees for this input
      .setLabel('Community code')
      // Short means only a single line of text
      .setStyle(TextInputStyle.Short);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(
      subscriptionKeyInput,
    ) as ActionRowBuilder<TextInputBuilder>;

    // Add inputs to the modal
    modal.addComponents(firstActionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  },
};

export default event;
