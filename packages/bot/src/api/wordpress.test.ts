import { describe, it, jest } from '@jest/globals';
import { WpSubscription } from './api_models.js';

const mockFetch = jest.fn<typeof fetch>();
jest.unstable_mockModule('node-fetch', () => ({
  default: mockFetch,
}));

const wordpress = await import('./wordpress.js');

const env = process.env;

describe('wordpress', () => {
  beforeAll(() => {
    process.env = {
      ...env,
    };
    process.env.WP_API_HOST = 'https://wp.com';
    process.env.WP_BEARER_TOKEN = 'abc123';
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    process.env = env;
  });

  it('getActiveSubscriptionsByKey', async () => {
    // Arrange
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([TEST_SUBSCRIPTION])),
    );

    // Act
    const subscriptions = await wordpress.getActiveSubscriptionsByKey('1234');

    // Assert
    expect(subscriptions).toEqual([TEST_SUBSCRIPTION_RESULT]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions?key=1234&_fields=id,mlc_subscription_sku,mlc_subscription_name,customer_id,mlc_community_user_id,mlc_community_username,mlc_subscription_active',
      {
        headers: {
          Authorization: 'Basic YWJjMTIz',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      },
    );
  });

  it('getActiveSubscriptionsByKey throws', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error());

    // Act
    const subscriptions$ = wordpress.getActiveSubscriptionsByKey('1234');

    // Assert
    expect(subscriptions$).rejects.toEqual(new Error());
  });

  it('getActiveSubscriptionsByCustomerId', async () => {
    // Arrange
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([TEST_SUBSCRIPTION])),
    );

    // Act
    const subscriptions = await wordpress.getActiveSubscriptionsByCustomerId(
      5678,
    );

    // Assert
    expect(subscriptions).toEqual([
      {
        id: TEST_SUBSCRIPTION.id,
        sku: TEST_SUBSCRIPTION.mlc_subscription_sku,
        name: TEST_SUBSCRIPTION.mlc_subscription_name,
        customerId: TEST_SUBSCRIPTION.customer_id,
        userId: TEST_SUBSCRIPTION.mlc_community_user_id,
        username: TEST_SUBSCRIPTION.mlc_community_username,
        active: TEST_SUBSCRIPTION.mlc_subscription_active,
      },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions?customer_id=5678&_fields=id,mlc_subscription_sku,mlc_subscription_name,customer_id,mlc_community_user_id,mlc_community_username,mlc_subscription_active',
      {
        headers: {
          Authorization: 'Basic YWJjMTIz',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      },
    );
  });

  it('getActiveSubscriptionsByCustomerId throws', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error());

    // Act
    const subscriptions$ = wordpress.getActiveSubscriptionsByCustomerId(5678);

    // Assert
    expect(subscriptions$).rejects.toEqual(new Error());
  });

  it('getAllSubscriptionsByUserId', async () => {
    // Arrange
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([TEST_SUBSCRIPTION])),
    );

    // Act
    const subscriptions = await wordpress.getAllSubscriptionsByUserId(
      '23452436',
    );

    // Assert
    expect(subscriptions).toEqual([
      {
        id: TEST_SUBSCRIPTION.id,
        sku: TEST_SUBSCRIPTION.mlc_subscription_sku,
        name: TEST_SUBSCRIPTION.mlc_subscription_name,
        customerId: TEST_SUBSCRIPTION.customer_id,
        userId: TEST_SUBSCRIPTION.mlc_community_user_id,
        username: TEST_SUBSCRIPTION.mlc_community_username,
        active: TEST_SUBSCRIPTION.mlc_subscription_active,
      },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions?active_only=false&mlc_community_user_id=23452436&_fields=id,mlc_subscription_sku,mlc_subscription_name,customer_id,mlc_community_user_id,mlc_community_username,mlc_subscription_active',
      {
        headers: {
          Authorization: 'Basic YWJjMTIz',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      },
    );
  });

  it('getAllSubscriptionsByUserId throws', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error());

    // Act
    const subscriptions$ = wordpress.getAllSubscriptionsByUserId('23452436');

    // Assert
    expect(subscriptions$).rejects.toEqual(new Error());
  });

  it('getSubscriptionIdsByUsername', async () => {
    // Arrange
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([TEST_SUBSCRIPTION])),
    );

    // Act
    const subscriptions = await wordpress.getSubscriptionIdsByUserId('2341256');

    // Assert
    expect(subscriptions).toEqual([1234]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions?active_only=false&mlc_community_user_id=2341256&_fields=id',
      {
        headers: {
          Authorization: 'Basic YWJjMTIz',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      },
    );
  });

  it('getSubscriptionIdsByUsername throws', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error());

    // Act
    const subscriptions$ = wordpress.getSubscriptionIdsByUserId('2341256');

    // Assert
    expect(subscriptions$).rejects.toEqual(new Error());
  });

  it('getSubscriptionUsernameById', async () => {
    // Arrange
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          meta: {
            mlc_community_user_id: 'testUserId',
          },
        }),
      ),
    );

    // Act
    const username = await wordpress.getUserIdBySubscriptionId('5678');

    // Assert
    expect(username).toEqual('testUserId');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/wp/v2/shop_subscription/5678?_fields=meta.mlc_community_user_id',
      {
        headers: {
          Authorization: 'Basic YWJjMTIz',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      },
    );
  });

  it('getSubscriptionUsernameById throws', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error());

    // Act
    const username$ = wordpress.getUserIdBySubscriptionId('5678');

    // Assert
    expect(username$).rejects.toEqual(new Error());
  });

  it('updateSubscriptionsCommunityUser', async () => {
    // Act
    await wordpress.updateSubscriptionsCommunityUser([456, 789], {
      userId: '63423523',
      username: 'testCommId',
    });

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions',
      {
        headers: {
          Authorization: 'Basic YWJjMTIz',
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: '[{"id":456,"meta":{"mlc_community_user_id":"63423523","mlc_community_username":"testCommId"}},{"id":789,"meta":{"mlc_community_user_id":"63423523","mlc_community_username":"testCommId"}}]',
      },
    );
  });

  it('updateSubscriptionsCommunityUserId throws', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error());

    // Act
    const result$ = wordpress.updateSubscriptionsCommunityUser([456, 789], {
      userId: '63423523',
      username: 'testCommId',
    });

    // Assert
    expect(result$).rejects.toEqual(new Error());
  });
});

const TEST_SUBSCRIPTION: WpSubscription = {
  id: 1234,
  customer_id: 567,
  mlc_community_user_id: 'testuser',
  mlc_subscription_sku: '5678',
  mlc_subscription_name: 'Test subscription',
  mlc_subscription_active: true,
};

const TEST_SUBSCRIPTION_RESULT = {
  id: TEST_SUBSCRIPTION.id,
  sku: TEST_SUBSCRIPTION.mlc_subscription_sku,
  name: TEST_SUBSCRIPTION.mlc_subscription_name,
  customerId: TEST_SUBSCRIPTION.customer_id,
  userId: TEST_SUBSCRIPTION.mlc_community_user_id,
  username: TEST_SUBSCRIPTION.mlc_community_username,
  active: TEST_SUBSCRIPTION.mlc_subscription_active,
};
