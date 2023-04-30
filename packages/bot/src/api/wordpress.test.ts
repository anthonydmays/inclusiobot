import { describe, it, jest } from '@jest/globals';
import { WpSubscription } from './types.js';

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
    mockFetch.mockReset();
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
    expect(subscriptions).toEqual([TEST_SUBSCRIPTION]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions?key=1234&_fields=id,customer_id,meta_data,mlc_subscription_sku,mlc_subscription_name',
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
    expect(subscriptions).toEqual([TEST_SUBSCRIPTION]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions?customer_id=5678&_fields=id,customer_id,meta_data,mlc_subscription_sku,mlc_subscription_name',
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

  it('getSubscriptionIdsByUsername', async () => {
    // Arrange
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([TEST_SUBSCRIPTION])),
    );

    // Act
    const subscriptions = await wordpress.getSubscriptionIdsByUsername(
      'amaysing',
    );

    // Assert
    expect(subscriptions).toEqual([1234]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions?mlc_community_user_id=amaysing&_fields=id',
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
    const subscriptions$ = wordpress.getSubscriptionIdsByUsername('amaysing');

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
    const username = await wordpress.getSubscriptionUsernameById('5678');

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
    const username$ = wordpress.getSubscriptionUsernameById('5678');

    // Assert
    expect(username$).rejects.toEqual(new Error());
  });

  it('updateSubscriptionsCommunityUserId', async () => {
    // Act
    await wordpress.updateSubscriptionsCommunityUserId(
      [456, 789],
      'testCommId',
    );

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wp.com/wp-json/mlc/v1/subscriptions',
      {
        headers: {
          Authorization: 'Basic YWJjMTIz',
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: '[{"id":456,"meta":{"mlc_community_user_id":"testCommId"}},{"id":789,"meta":{"mlc_community_user_id":"testCommId"}}]',
      },
    );
  });

  it('updateSubscriptionsCommunityUserId throws', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error());

    // Act
    const result$ = wordpress.updateSubscriptionsCommunityUserId(
      [456, 789],
      'testCommId',
    );

    // Assert
    expect(result$).rejects.toEqual(new Error());
  });
});

const TEST_SUBSCRIPTION: WpSubscription = {
  id: 1234,
  mlc_community_user_id: 'testuser',
  mlc_subscription_sku: '5678',
  mlc_subscription_name: 'Test subscription',
  meta_data: [],
};
