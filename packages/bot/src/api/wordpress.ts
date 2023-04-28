import { WpSubscription } from './types.js';

export async function getActiveSubscriptionsByKey(
  subscriptionKey: string,
): Promise<Array<WpSubscription>> {
  const endpoint = `${process.env.WP_API_HOST}/wp-json/mlc/v1/subscriptions`;
  const url = `${endpoint}?key=${subscriptionKey}&_fields=id,customer_id,meta_data,mlc_subscription_sku,mlc_subscription_name`;
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
}

export async function getActiveSubscriptionsByCustomerId(
  customerId: string,
): Promise<Array<WpSubscription>> {
  const endpoint = `${process.env.WP_API_HOST}/wp-json/mlc/v1/subscriptions`;
  const url = `${endpoint}?customer_id=${customerId}&_fields=id,customer_id,meta_data,mlc_subscription_sku,mlc_subscription_name`;
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
}

export async function updateSubscriptionCommunityUserId(
  subscriptionId: string,
  username: string,
) {
  const endpoint = `${process.env.WP_API_HOST}/wp-json/wp/v2/shop_subscription`;
  const url = `${endpoint}/${subscriptionId}`;
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
}
