import * as dotenv from 'dotenv';

dotenv.config();

/** A map of roles by SKU. */
export const ROLE_BY_SKU: Record<string, string> = Object.fromEntries(
  process.env.SKU_ROLES?.split(';').map((e) => {
    const pair = e!.split(':');
    return [pair[0], pair[1]];
  }) || [],
);

/**
 * A list of roles ids that protects users from having their roles removed if a
 * sync error occurs.
 */
export const SPECIAL_ROLE_IDS: ReadonlySet<string> = new Set<string>(
  process.env.SPECIAL_ROLE_IDS?.split(',') || [],
);

export interface Subscription {
  id: number;
  name?: string;
  sku?: string;
  customerId?: number;
  username?: string;
  userId?: string;
  active: boolean;
}
