import {
  ActionRowBuilder,
  Client,
  Events,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a Client instance with our bot token.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the bot is connected and ready, log to console.
client.once(Events.ClientReady, () => {
  console.log('Connected and ready.');
});

// Every time a message is sent anywhere the bot is present,
// this event will fire and we will checbk if the bot was mentioned.
// If it was, the bot will attempt to respond with "Present".
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId('communityCodeModal')
      .setTitle('Please provide your community code');

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
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'communityCodeModal') {
      const communityCode =
        interaction.fields.getTextInputValue('communityCodeInput');
      await interaction.reply({
        content: `Your code ${communityCode} was verified successfully!`,
        ephemeral: true,
      });
    }
  }
});

client.on('unhandledRejection', (err) => {
  console.warn(err);
});

client.login(process.env.DISCORD_BOT_TOKEN);
