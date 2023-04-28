import { Interaction } from 'discord.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: 'interactionCreate',
  execute: (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      command.execute(interaction);
    }
  },
};

export default event;
