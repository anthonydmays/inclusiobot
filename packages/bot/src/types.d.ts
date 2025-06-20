import { Collection } from 'discord.js';
import { SlashCommand } from './SlashCommand.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_GUILD_ID: string;
      WP_BEARER_TOKEN: string;
      WP_API_HOST: string;
      SKU_ROLES: string;
      INCLUSIO_API_VERSION: string;
      DISABLE_SERVER_FOR_TESTS: string;
    }
  }
}

export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
  }
}
