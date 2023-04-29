import { it, jest } from '@jest/globals';
import { ChatInputCommandInteraction } from 'discord.js';
import { describe } from 'node:test';
import interactionCreate from './interaction_create.js';

describe('interactionCreate', () => {
  it('invokes command if found', async () => {
    const command = {
      execute: jest.fn(),
    };
    const interaction = {
      commandName: 'testCommand',
      isChatInputCommand: jest.fn().mockReturnValue(true),
      client: {
        commands: new Map([['testCommand', command]]),
      },
    } as unknown as ChatInputCommandInteraction;

    interactionCreate.execute(interaction);

    expect(command.execute).toHaveBeenCalledWith(interaction);
  });

  it('does not invoke command if mismatched', async () => {
    const command = {
      execute: jest.fn(),
    };
    const interaction = {
      commandName: 'notFound',
      isChatInputCommand: jest.fn().mockReturnValue(true),
      client: {
        commands: new Map([['testCommand', command]]),
      },
    } as unknown as ChatInputCommandInteraction;

    interactionCreate.execute(interaction);

    expect(command.execute).not.toHaveBeenCalled();
  });
});
