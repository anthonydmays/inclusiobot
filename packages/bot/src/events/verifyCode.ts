import { Interaction } from 'discord.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: 'interactionCreate',
  execute: async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'communityCodeModal') return;

    const communityCode =
      interaction.fields.getTextInputValue('communityCodeInput');
    await interaction.reply({
      content: `Your code ${communityCode} was verified successfully!`,
      ephemeral: true,
    });
  },
};

export default event;
