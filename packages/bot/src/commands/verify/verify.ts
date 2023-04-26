import {
  ActionRowBuilder,
  Interaction,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Command } from '../../types.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription(
      'Verifies the current user and assigns the appropriate role.',
    ),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId('communityCodeModal')
      .setTitle('Provide your community code');

    // Add components to modal

    // Create the text input components
    const communityCodeInput = new TextInputBuilder()
      .setCustomId('communityCodeInput')
      // The label is the prompt the user sees for this input
      .setLabel('Community code')
      // Short means only a single line of text
      .setStyle(TextInputStyle.Short);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(
      communityCodeInput,
    ) as ActionRowBuilder<TextInputBuilder>;

    // Add inputs to the modal
    modal.addComponents(firstActionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  },
};

export default command;
