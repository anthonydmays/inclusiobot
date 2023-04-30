import { describe, it, jest } from '@jest/globals';
import bodyParser from 'body-parser';
import { Client, Collection, Guild, GuildMember, Role } from 'discord.js';
import express, { Application } from 'express';
import request from 'supertest';
import { WpSubscription } from '../../api/types.js';

jest.unstable_mockModule('../../api/wordpress.js', () => ({
  getActiveSubscriptionsByCustomerId: jest.fn(),
  getSubscriptionUsernameById: jest.fn(),
}));
jest.unstable_mockModule('../../constants.js', () => ({
  ROLE_BY_SKU: {
    SKU5: 'role213',
  },
  SPECIAL_ROLE_IDS: ['pqr', 'xyz'],
}));

const { getCustomersApi } = await import('./customers.js');

const wordpress = await import('../../api/wordpress.js');

describe('customers', () => {
  let app: Application;
  let client: Client;
  let guild: Guild;
  let member: GuildMember;

  const env = process.env;

  beforeAll(() => {
    process.env = {
      ...env,
    };
    process.env.DISCORD_GUILD_ID = '213guild';
  });

  beforeEach(() => {
    jest.resetAllMocks();
    app = express();

    client = {
      guilds: {
        resolve: jest.fn(),
      },
    } as unknown as Client;

    guild = {
      members: {
        search: jest.fn(),
      },
      roles: {
        resolve: jest.fn(),
      },
    } as unknown as Guild;

    member = {
      user: {
        username: 'blahuser',
      },
      roles: {
        cache: {
          hasAny: jest.fn(),
        },
        set: jest.fn(),
      },
    } as unknown as GuildMember;

    app.use(bodyParser.json());
    app.use('/', getCustomersApi(client));
  });

  afterAll(() => {
    process.env = env;
  });

  it('does not sync customers without subscriptions', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([]);
    const mockGetUsername = jest.mocked(wordpress.getSubscriptionUsernameById);

    // Act
    const res = await request(app).put('/365/syncMembership');

    // Assert
    expect(res.status).toBe(200);
    expect(res.text).toBe('Member not verified.');
    expect(mockGetUsername).not.toHaveBeenCalled();
  });

  it('attempts to locate username using provided subscription', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([]);
    const mockGetUsername = jest.mocked(wordpress.getSubscriptionUsernameById);
    mockGetUsername.mockResolvedValue('');

    // Act
    const res = await request(app)
      .put('/365/syncMembership')
      .send({ subscriptionId: 'adm' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.text).toBe('Member not verified.');
    expect(mockGetUsername).toHaveBeenCalledWith('adm');
  });

  it('uses max level subscription username', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue(TEST_SUBSCRIPTIONS);
    const mockGetUsername = jest.mocked(wordpress.getSubscriptionUsernameById);

    // Act
    const res = await request(app)
      .put('/365/syncMembership')
      .send({ subscriptionId: 'adm' });

    // Assert
    expect(mockGetUsername).not.toHaveBeenCalled();
  });

  it("uses provided subscription's username", async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([]);
    const mockGetUsername = jest.mocked(wordpress.getSubscriptionUsernameById);
    mockGetUsername.mockResolvedValue('anothername');

    // Act
    const res = await request(app)
      .put('/365/syncMembership')
      .send({ subscriptionId: 'adm' });

    // Assert
    expect(mockGetUsername).toHaveBeenCalledWith('adm');
  });

  it('returns error when guild not found', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue(TEST_SUBSCRIPTIONS);
    const mockGetUsername = jest.mocked(wordpress.getSubscriptionUsernameById);

    // Act
    const res = await request(app)
      .put('/365/syncMembership')
      .send({ subscriptionId: 'adm' });

    // Assert
    expect(res.status).toBe(500);
    expect(res.text).toBe('Guild not found.');
  });

  it('returns error when member not found', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue(TEST_SUBSCRIPTIONS);
    jest.mocked(client.guilds.resolve).mockReturnValue(guild);
    jest.mocked(guild.members.search).mockResolvedValue(new Collection());

    // Act
    const res = await request(app).put('/365/syncMembership');

    // Assert
    expect(res.status).toBe(422);
    expect(res.text).toBe('Customer 365 could not be updated.');
  });

  it('removes all roles from members with no active sku', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([]);
    const mockGetUsername = jest.mocked(wordpress.getSubscriptionUsernameById);
    mockGetUsername.mockResolvedValue('anothername');
    jest.mocked(client.guilds.resolve).mockReturnValue(guild);
    jest
      .mocked(guild.members.search)
      .mockResolvedValue(new Collection([['id', member]]));

    // Act
    const res = await request(app)
      .put('/365/syncMembership')
      .send({ subscriptionId: 'adm' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.text).toBe(
      'All roles removed from customer 365 with username anothername.',
    );
    expect(member.roles.set).toHaveBeenCalledWith([]);
  });

  it('does not remove roles from members with protected role', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([]);
    const mockGetUsername = jest.mocked(wordpress.getSubscriptionUsernameById);
    mockGetUsername.mockResolvedValue('anothername');
    jest.mocked(client.guilds.resolve).mockReturnValue(guild);
    jest
      .mocked(guild.members.search)
      .mockResolvedValue(new Collection([['id', member]]));
    jest.mocked(member.roles.cache.hasAny).mockReturnValue(true);

    // Act
    const res = await request(app)
      .put('/365/syncMembership')
      .send({ subscriptionId: 'adm' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.text).toBe('Member anothername is special. Not removing roles.');
    expect(member.roles.cache.hasAny).toHaveBeenCalledWith('pqr', 'xyz');
    expect(member.roles.set).not.toHaveBeenCalled();
  });

  it('errors if sku role is not configured', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue(TEST_SUBSCRIPTIONS);
    jest.mocked(client.guilds.resolve).mockReturnValue(guild);
    jest
      .mocked(guild.members.search)
      .mockResolvedValue(new Collection([['id', member]]));

    // Act
    const res = await request(app).put('/365/syncMembership');

    // Assert
    expect(res.status).toBe(500);
    expect(res.text).toBe('Role for sku SKU4 not configured.');
  });

  it('errors if sku role is invalid', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([TEST_SUBSCRIPTION_SKU5]);
    jest.mocked(client.guilds.resolve).mockReturnValue(guild);
    jest
      .mocked(guild.members.search)
      .mockResolvedValue(new Collection([['id', member]]));
    jest.mocked(member.roles.cache.hasAny).mockReturnValue(true);

    // Act
    const res = await request(app).put('/365/syncMembership');

    // Assert
    expect(res.status).toBe(500);
    expect(res.text).toBe('Role cannot be assigned: not found.');
    expect(guild.roles.resolve).toHaveBeenCalledWith('role213');
  });

  it('sets the appropriate role for the user', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([TEST_SUBSCRIPTION_SKU5]);
    jest.mocked(client.guilds.resolve).mockReturnValue(guild);
    jest
      .mocked(guild.members.search)
      .mockResolvedValue(new Collection([['id', member]]));
    jest.mocked(member.roles.cache.hasAny).mockReturnValue(true);
    const fakeRole = {} as unknown as Role;
    jest.mocked(guild.roles.resolve).mockReturnValue(fakeRole);

    // Act
    const res = await request(app).put('/365/syncMembership');

    // Assert
    expect(res.status).toBe(200);
    expect(member.roles.set).toHaveBeenCalledWith([fakeRole]);
  });

  it('errors when role update fails', async () => {
    // Arrange
    const mockGetActiveSubs = jest.mocked(
      wordpress.getActiveSubscriptionsByCustomerId,
    );
    mockGetActiveSubs.mockResolvedValue([TEST_SUBSCRIPTION_SKU5]);
    jest.mocked(client.guilds.resolve).mockReturnValue(guild);
    jest
      .mocked(guild.members.search)
      .mockResolvedValue(new Collection([['id', member]]));
    jest.mocked(member.roles.cache.hasAny).mockReturnValue(true);
    const fakeRole = {} as unknown as Role;
    jest.mocked(guild.roles.resolve).mockReturnValue(fakeRole);
    jest
      .mocked(member.roles.set)
      .mockRejectedValue(new Error('something happened'));

    // Act
    const res = await request(app).put('/365/syncMembership');

    // Assert
    expect(res.status).toBe(500);
    expect(res.text).toBe('Role cannot be assigned. Error: something happened');
    expect(member.roles.set).toHaveBeenCalledWith([fakeRole]);
  });
});

const TEST_SUBSCRIPTIONS: WpSubscription[] = [
  {
    id: 567,
    mlc_subscription_sku: 'SKU1',
    mlc_subscription_name: 'name2',
    mlc_community_user_id: 'userid3',
    meta_data: [{ id: 8, key: 'mlc_community_user_id', value: 'userid7' }],
  },
  {
    id: 234,
    mlc_subscription_sku: 'SKU4',
    mlc_subscription_name: 'name5',
    mlc_community_user_id: 'userid6',
    meta_data: [{ id: 9, key: 'mlc_community_user_id', value: 'userid8' }],
  },
];

const TEST_SUBSCRIPTION_SKU5: WpSubscription = {
  id: 234,
  mlc_subscription_sku: 'SKU5',
  mlc_subscription_name: 'name5',
  mlc_community_user_id: 'userid6',
  meta_data: [{ id: 9, key: 'mlc_community_user_id', value: 'userid8' }],
};
