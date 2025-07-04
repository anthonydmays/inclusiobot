import {
  ActionRowBuilder,
  APIActionRowComponent,
  APIButtonComponent,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { SlashCommand } from '../SlashCommand.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('initchannel')
    .setDescription('Initializes the verify channel.'),
  async execute(interaction: ChatInputCommandInteraction) {
    const confirm = new ButtonBuilder()
      .setCustomId('verifyButton')
      .setLabel('Verify me')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(confirm);

    await interaction.reply({
      content: VERIFY_MESSAGE,
      components: [row as unknown as APIActionRowComponent<APIButtonComponent>],
    });
  },
};

export const VERIFY_MESSAGE = `>>> *Verify membership*
     
In order to receive your role, please login to your account at 
[morganlatimer.com](https://morganlatimer.com) and copy the code from the My Subscription
section.
    
Click the button below to start verification.`;

export default command;
