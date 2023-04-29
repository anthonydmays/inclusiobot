import { Events, Interaction } from 'discord.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.InteractionCreate,
  execute: (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      command.execute(interaction);
    }
  },
};

export default event;
