import { Client, Events } from 'discord.js';
import { color } from '../functions.js';
import { BotEvent } from '../types.js';

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute: (client: Client) => {
    console.log(
      color('text', `💪 Logged in as ${color('variable', client.user?.tag)}`),
    );
  },
};

export default event;
