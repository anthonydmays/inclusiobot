import { describe, expect, it, jest } from '@jest/globals';
import { Events, ModalSubmitInteraction } from 'discord.js';
import { WpSubscription } from '../api/types.js';

jest.unstable_mockModule('../api/wordpress.js', () => ({
  getActiveSubscriptionsByKey: jest.fn(),
  updateSubscriptionsCommunityUser: jest.fn(),
}));
jest.unstable_mockModule('../constants.js', () => ({
  ROLE_BY_SKU: {
    '789': '456789',
  },
}));

const {
  getActiveSubscriptionsByKey,
  updateSubscriptionsCommunityUser: updateSubscriptionsCommunityUser,
} = await import('../api/wordpress.js');
const verifyCode = (await import('./verify_code.js')).default;

describe('verifyCode', () => {
  it('listens to the correct event', async () => {
    expect(verifyCode.name).toEqual(Events.InteractionCreate);
  });

  it('does nothing if not a submit interaction', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(false),
      deferReply: jest.fn(),
    } as unknown as ModalSubmitInteraction;

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(interaction.deferReply).not.toHaveBeenCalled();
  });

  it('does nothing if not the right interaction', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'wrongid',
      deferReply: jest.fn(),
    } as unknown as ModalSubmitInteraction;

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(interaction.deferReply).not.toHaveBeenCalled();
  });

  it('does not assign roles when user has no subscription', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'subscriptionKeyModal',
      user: {
        id: '231241512',
        username: 'testuser',
      },
      deferReply: jest.fn(),
      followUp: jest.fn(),
      fields: {
        getTextInputValue: jest.fn().mockReturnValue('blah'),
      },
    } as unknown as ModalSubmitInteraction;
    const mockGetActiveSubs = jest.mocked(getActiveSubscriptionsByKey);
    mockGetActiveSubs.mockResolvedValue([]);

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(interaction.deferReply).toHaveBeenCalledWith({ ephemeral: true });
    expect(mockGetActiveSubs).toHaveBeenCalledWith('blah');
    expect(interaction.followUp).toHaveBeenCalledWith({
      content: 'Your subscription **could not** be verified.',
    });
  });

  it('updates the subscription and user roles', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'subscriptionKeyModal',
      user: {
        id: '231241512',
        username: 'testuser',
      },
      deferReply: jest.fn(),
      followUp: jest.fn(),
      fields: {
        getTextInputValue: jest.fn().mockReturnValue('blah'),
      },
      guild: {
        members: {
          addRole: jest.fn(),
        },
      },
    } as unknown as ModalSubmitInteraction;
    const mockGetActiveSubs = jest.mocked(getActiveSubscriptionsByKey);
    mockGetActiveSubs.mockResolvedValue([
      {
        id: 123,
        mlc_subscription_name: 'Pro Subscription',
        mlc_subscription_sku: '789',
      } as WpSubscription,
    ]);
    const mockUpdateSub = jest.mocked(updateSubscriptionsCommunityUser);

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(mockGetActiveSubs).toHaveBeenCalledWith('blah');
    expect(mockUpdateSub).toHaveBeenCalledWith([123], {
      userId: '231241512',
      username: 'testuser',
    });
    expect(interaction.guild?.members.addRole).toHaveBeenCalledWith(
      expect.objectContaining({
        user: interaction.user,
        role: '456789',
      }),
    );
    expect(interaction.followUp).toHaveBeenCalledWith({
      content:
        'Your subscription to **Pro Subscription** was verified successfully!',
    });
  });

  it('does not update role when missing', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'subscriptionKeyModal',
      user: {
        username: 'testuser',
      },
      deferReply: jest.fn(),
      followUp: jest.fn(),
      fields: {
        getTextInputValue: jest.fn().mockReturnValue('blah'),
      },
      guild: {
        members: {
          addRole: jest.fn(),
        },
      },
    } as unknown as ModalSubmitInteraction;
    const mockGetActiveSubs = jest.mocked(getActiveSubscriptionsByKey);
    mockGetActiveSubs.mockResolvedValue([
      {
        id: 123,
        mlc_subscription_name: 'Pro Subscription',
        mlc_subscription_sku: '777',
      } as WpSubscription,
    ]);

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(interaction.guild?.members.addRole).not.toHaveBeenCalled();
  });
});
