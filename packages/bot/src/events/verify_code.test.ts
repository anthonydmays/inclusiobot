import { describe, expect, it, jest } from '@jest/globals';
import { Events, ModalSubmitInteraction } from 'discord.js';
import { Subscription } from '../models.js';

jest.unstable_mockModule('../api/wordpress.js', () => ({
  getActiveSubscriptionsByKey: jest.fn(),
  updateSubscriptionsCommunityUser: jest.fn(),
}));
jest.unstable_mockModule('../models.js', () => ({
  ROLE_BY_SKU: {
    '789': '456789',
  },
}));

const { getActiveSubscriptionsByKey, updateSubscriptionsCommunityUser } =
  await import('../api/wordpress.js');
const verifyCode = (await import('./verify_code.js')).default;

describe('verifyCode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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
      content:
        '**No subscription found.** Please contact support@morganlatimer.com for assistance.',
    });
  });

  it('updates the subscription and user roles', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'subscriptionKeyModal',
      user: {
        id: '231241512',
        tag: 'testuser#123',
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
        name: 'Pro Subscription',
        sku: '789',
        userId: '231241512',
        username: 'testuser#123',
        active: true,
      } as Subscription,
    ]);
    const mockUpdateSub = jest.mocked(updateSubscriptionsCommunityUser);

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(mockGetActiveSubs).toHaveBeenCalledWith('blah');
    expect(mockUpdateSub).toHaveBeenCalledWith([123], {
      userId: '231241512',
      username: 'testuser#123',
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

  it('prevents multiple key verifications', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'subscriptionKeyModal',
      user: {
        id: '231241512',
        tag: 'testuser#123',
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
        name: 'Pro Subscription',
        sku: '789',
        userId: '1234567',
        username: 'anotheruser#456',
        active: true,
      } as Subscription,
    ]);
    const mockUpdateSub = jest.mocked(updateSubscriptionsCommunityUser);
    const mockAddRole = jest.mocked(interaction.guild!.members.addRole);

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(interaction.followUp).toHaveBeenCalledWith({
      content:
        'Key **already verified** by another user. Please contact support@morganlatimer.com for assistance.',
    });
    expect(mockUpdateSub).not.toHaveBeenCalled();
    expect(mockAddRole).not.toHaveBeenCalled();
  });

  it('reports role update errors', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'subscriptionKeyModal',
      user: {
        id: '231241512',
        tag: 'testuser#123',
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
        name: 'Pro Subscription',
        sku: '789',
        userId: '231241512',
        username: 'testuser#123',
        active: true,
      } as Subscription,
    ]);
    const mockUpdateSub = jest.mocked(updateSubscriptionsCommunityUser);
    const mockAddRole = jest.mocked(interaction.guild!.members.addRole);
    mockAddRole.mockRejectedValue(new Error());

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(interaction.followUp).toHaveBeenCalledWith({
      content:
        'Your subscription was verified but something went wrong. Please contact support or email support@morganlatimer.com.',
    });
  });

  it('does not update role when missing', async () => {
    // Arrange
    const interaction = {
      isModalSubmit: jest.fn().mockReturnValue(true),
      customId: 'subscriptionKeyModal',
      user: {
        tag: 'testuser#123',
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
        name: 'Pro Subscription',
        sku: '777',
        active: true,
      } as Subscription,
    ]);

    // Act
    await verifyCode.execute(interaction);

    // Assert
    expect(interaction.guild?.members.addRole).not.toHaveBeenCalled();
  });
});
