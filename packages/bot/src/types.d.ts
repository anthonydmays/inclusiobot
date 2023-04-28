import {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
} from 'discord.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_GUILD_ID: string;
      WP_BEARER_TOKEN: string;
      WP_API_HOST: string;
      SKU_ROLES: string;
    }
  }
}

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
}

export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, SlashCommand>;
    commands: Collection<string, Command>;
    cooldowns: Collection<string, number>;
  }
}
