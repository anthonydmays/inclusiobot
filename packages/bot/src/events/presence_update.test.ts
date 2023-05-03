import { describe, expect, it, jest } from '@jest/globals';

jest.unstable_mockModule('../api/wordpress.js', () => ({
  getAllSubscriptionsByUserId: jest.fn(),
  updateSubscriptionsCommunityUser: jest.fn(),
}));

const { getAllSubscriptionsByUserId, updateSubscriptionsCommunityUser } =
  await import('../api/wordpress.js');
const presenceUpdate = (await import('./presence_update.js')).default;

describe('presenceUpdate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('does nothing for bots', async () => {
    // Arrange
    const after = {
      user: {
        bot: true,
        tag: 'testuser#123',
        id: '12345',
      },
    };

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(getAllSubscriptionsByUserId).not.toHaveBeenCalled();
    expect(updateSubscriptionsCommunityUser).not.toHaveBeenCalled();
  });

  it('ignores users not going online or offline', async () => {
    // Arrange
    const after = {
      status: 'notonline',
      user: {
        tag: 'testuser#123',
        id: '12345',
      },
    };

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(getAllSubscriptionsByUserId).not.toHaveBeenCalled();
    expect(updateSubscriptionsCommunityUser).not.toHaveBeenCalled();
  });

  it('does not remove roles for protected users', async () => {
    // Arrange
    const user = {
      tag: 'testuser#123',
      id: '12345',
    };
    const member = {
      roles: {
        cache: {
          find: jest.fn().mockReturnValue(true),
        },
        set: jest.fn(),
      },
    };
    const after = {
      status: 'online',
      member,
      user,
    };
    jest.mocked(getAllSubscriptionsByUserId).mockResolvedValue([]);

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(getAllSubscriptionsByUserId).toHaveBeenCalledWith('12345');
    expect(member.roles.cache.find).toHaveBeenCalled();
    expect(member.roles.set).not.toHaveBeenCalled();
    expect(updateSubscriptionsCommunityUser).not.toHaveBeenCalled();
  });

  it('removes roles when no subscription found for user', async () => {
    // Arrange
    const user = {
      tag: 'testuser#123',
      id: '12345',
    };
    const member = {
      roles: {
        cache: {
          find: jest.fn(),
        },
        set: jest.fn(),
      },
    };
    const after = {
      status: 'online',
      member,
      user,
    };
    jest.mocked(getAllSubscriptionsByUserId).mockResolvedValue([]);

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(member.roles.cache.find).toHaveBeenCalled();
    expect(member.roles.set).toHaveBeenCalledWith([]);
    expect(updateSubscriptionsCommunityUser).not.toHaveBeenCalled();
  });

  it('does not update username when not changed', async () => {
    // Arrange
    const after = {
      status: 'online',
      user: {
        tag: 'testuser#123',
        id: '12345',
      },
    };
    jest.mocked(getAllSubscriptionsByUserId).mockResolvedValue([
      {
        id: 256,
        active: true,
        userId: '12345',
        username: 'testuser#123',
      },
    ]);

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(updateSubscriptionsCommunityUser).not.toHaveBeenCalled();
  });

  it('ignores update errors', async () => {
    // Arrange
    const after = {
      status: 'offline',
      user: {
        tag: 'testuser#123',
        id: '12345',
      },
    };
    jest.mocked(getAllSubscriptionsByUserId).mockResolvedValue([
      {
        id: 456,
        active: true,
        userId: '12345',
        username: 'testuser#456',
      },
    ]);
    jest
      .mocked(updateSubscriptionsCommunityUser)
      .mockRejectedValue(new Error());

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(updateSubscriptionsCommunityUser).toHaveBeenCalled();
  });

  it('updates username on active subscriptions when changed', async () => {
    // Arrange
    const after = {
      status: 'online',
      user: {
        tag: 'testuser#123',
        id: '12345',
      },
    };
    jest.mocked(getAllSubscriptionsByUserId).mockResolvedValue([
      {
        id: 256,
        active: true,
        userId: '12345',
        username: 'testuser#123',
      },
      {
        id: 456,
        active: true,
        userId: '12345',
        username: 'testuser#456',
      },
    ]);

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(updateSubscriptionsCommunityUser).toHaveBeenCalledWith([456], {
      userId: after.user.id,
      username: after.user.tag,
    });
  });

  it('updates blank usernames', async () => {
    // Arrange
    const after = {
      status: 'online',
      user: {
        tag: 'testuser#123',
        id: '12345',
      },
    };
    jest.mocked(getAllSubscriptionsByUserId).mockResolvedValue([
      {
        id: 456,
        active: true,
        userId: '12345',
        username: '',
      },
    ]);

    // Act
    await presenceUpdate.execute(undefined, after);

    // Assert
    expect(updateSubscriptionsCommunityUser).toHaveBeenCalledWith([456], {
      userId: after.user.id,
      username: after.user.tag,
    });
  });
});
