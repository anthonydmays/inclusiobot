import fetch from 'node-fetch';
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
  customerId: number,
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

export async function getUserIdBySubscriptionId(
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

export async function getSubscriptionIdsByUserId(
  userId: string,
): Promise<number[]> {
  console.info(`Fetching subscriptions with userId ${userId}.`);
  const endpoint = `${process.env.WP_API_HOST}/wp-json/mlc/v1/subscriptions`;
  const url = `${endpoint}?mlc_community_user_id=${userId}&_fields=id`;
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
    return res.map((s) => s.id);
  } catch (ex) {
    console.error(`Error retrieving subscriptions by userId:`, ex);
    throw ex;
  }
}

export async function updateSubscriptionsCommunityUsername(
  subscriptionIds: readonly number[],
  username: string,
) {
  console.info(
    `Updating username ${username} for subscriptions`,
    subscriptionIds,
  );
  const url = `${process.env.WP_API_HOST}/wp-json/mlc/v1/subscriptions`;
  try {
    const req = subscriptionIds.map((id) => ({
      id,
      meta: { mlc_community_username: username },
    }));
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          process.env.WP_BEARER_TOKEN,
          'utf-8',
        ).toString('base64')}`,
      },
      body: JSON.stringify(req),
    });
  } catch (ex) {
    console.error(
      `Error updating community username for ${username} subscriptions:`,
      ex,
    );
    throw ex;
  }
}
