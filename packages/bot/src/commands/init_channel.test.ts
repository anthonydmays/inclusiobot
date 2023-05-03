import { describe, it, jest } from '@jest/globals';
import {
  ActionRow,
  ActionRowComponent,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
} from 'discord.js';
import initChannel, { VERIFY_MESSAGE } from './init_channel.js';

describe('interactionCreate', () => {
  it('matches the correct command name', () => {
    expect(initChannel.data.name).toEqual('initchannel');
  });

  it('invokes command if found', async () => {
    // Arrange
    const interaction = {
      reply: jest.fn((opts: InteractionReplyOptions) => {
        expect(opts.components?.length).toBe(1);
        const row = opts.components!.at(0) as ActionRow<ActionRowComponent>;
        const button = row.components.at(0);
        expect(button?.toJSON()).toEqual(
          expect.objectContaining({
            custom_id: 'verifyButton',
            label: 'Verify me',
          }),
        );
      }),
    } as unknown as ChatInputCommandInteraction;

    // Act
    initChannel.execute(interaction);

    // Assert
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: VERIFY_MESSAGE,
      }),
    );
  });
});
