import { createTerminus } from '@godaddy/terminus';
import bodyParser from 'body-parser';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { getApi } from './controllers/v1/api.js';
import { SlashCommand } from './SlashCommand.js';
import { BotEvent } from './types.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  console.log(`Adding command ${file}`);
  const command = (await import(filePath)).default as SlashCommand;
  client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = (await import(filePath)).default as BotEvent;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`Adding event ${file} listening to ${event.name}`);
}

client.on(Events.Error, (error) => {
  console.error('Encountered API error:', error);
});

client.login(process.env.DISCORD_BOT_TOKEN);

export const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/v1', getApi(client));

async function onHealthCheck() {
  return true;
}

const server = createServer(app);
createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: { '/healthcheck': onHealthCheck },
  statusOkResponse: {
    version: process.env.INCLUSIO_API_VERSION || 'X.X.X',
  },
});

if (!process.env.DISABLE_SERVER_FOR_TESTS) {
  const port = process.env.PORT || 3000;
  server.listen(port);
  console.log(`Server started on port ${port}`);
}
