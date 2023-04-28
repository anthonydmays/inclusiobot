import { WpSubscription } from './types.js';

export async function getActiveSubscriptionsByKey(
  subscriptionKey: string,
): Promise<Array<WpSubscription>> {
  console.info(`Fetching active subscriptions with key ${subscriptionKey}.`);
  const endpoint = `${process.env.WP_API_HOST}/wp-json/mlc/v1/subscriptions`;
  const url = `${endpoint}?key=${subscriptionKey}&_fields=id,customer_id,meta_data,mlc_subscription_sku,mlc_subscription_name`;
  try {
    const res = (await (
      await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.WP_BEARER_TOKEN,
            'utf-8',
          ).toString('base64')}`,
        },
      })
    ).json()) as Array<WpSubscription>;
    return res;
  } catch (ex) {
    console.error(`Error retrieving subscriptions by key:`, ex);
    throw ex;
  }
}

export async function getActiveSubscriptionsByCustomerId(
  customerId: string,
): Promise<Array<WpSubscription>> {
  console.info(`Fetching active subscriptions for customer ${customerId}.`);
  const endpoint = `${process.env.WP_API_HOST}/wp-json/mlc/v1/subscriptions`;
  const url = `${endpoint}?customer_id=${customerId}&_fields=id,customer_id,meta_data,mlc_subscription_sku,mlc_subscription_name`;
  try {
    const res = (await (
      await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.WP_BEARER_TOKEN,
            'utf-8',
          ).toString('base64')}`,
        },
      })
    ).json()) as Array<WpSubscription>;
    return res;
  } catch (ex) {
    console.error(`Error retrieving subscriptions by customer:`, ex);
    throw ex;
  }
}

export async function getSubscriptionUsernameById(
  subscriptionId: string,
): Promise<string | undefined> {
  console.info(`Fetching subscription with ID ${subscriptionId}.`);
  const endpoint = `${process.env.WP_API_HOST}/wp-json/wp/v2/shop_subscription`;
  const url = `${endpoint}/${subscriptionId}?_fields=meta.mlc_community_user_id`;
  try {
    const res = (await (
      await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.WP_BEARER_TOKEN,
            'utf-8',
          ).toString('base64')}`,
        },
      })
    ).json()) as { meta?: { mlc_community_user_id: string | undefined } };
    return res?.meta?.mlc_community_user_id;
  } catch (ex) {
    console.error(`Error retrieving subscriptions by key:`, ex);
    throw ex;
  }
}

export async function updateSubscriptionCommunityUserId(
  subscriptionId: string,
  username: string,
) {
  const endpoint = `${process.env.WP_API_HOST}/wp-json/wp/v2/shop_subscription`;
  const url = `${endpoint}/${subscriptionId}`;
  try {
    const res = await (
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.WP_BEARER_TOKEN,
            'utf-8',
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          meta: {
            mlc_community_user_id: username,
          },
        }),
      })
    ).json();
  } catch (ex) {
    console.error(
      `Error updating community user id for ${username} subscription ${subscriptionId}:`,
      ex,
    );
    throw ex;
  }
}
