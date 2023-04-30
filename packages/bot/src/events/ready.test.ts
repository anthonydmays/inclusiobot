import { describe, it, jest } from '@jest/globals';
import { ChatInputCommandInteraction } from 'discord.js';
import { color } from '../functions.js';
import ready from './ready.js';

jest.spyOn(console, 'log');

describe('ready', () => {
  it('notifies when connected', async () => {
    // Arrage
    const command = {
      execute: jest.fn(),
    };
    const client = {
      user: {
        tag: 'testUser#123',
      },
    } as unknown as ChatInputCommandInteraction;

    // Act
    ready.execute(client);

    // Assert
    expect(console.log).toHaveBeenCalledWith(
      color('text', `💪 Logged in as ${color('variable', 'testUser#123')}`),
    );
  });
});
