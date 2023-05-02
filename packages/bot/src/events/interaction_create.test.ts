import { describe, it, jest } from '@jest/globals';
import { ChatInputCommandInteraction, Events } from 'discord.js';
import interactionCreate from './interaction_create.js';

describe('interactionCreate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('matches the correct event', () => {
    expect(interactionCreate.name).toEqual(Events.InteractionCreate);
    expect(interactionCreate.once).toBeFalsy();
  });

  it('invokes command if found', async () => {
    // Arrage
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

    // Act
    interactionCreate.execute(interaction);

    // Assert
    expect(command.execute).toHaveBeenCalledWith(interaction);
  });

  it('does not invoke command if mismatched', async () => {
    // Arrange
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

    // Act
    interactionCreate.execute(interaction);

    // Assert
    expect(command.execute).not.toHaveBeenCalled();
  });
});
