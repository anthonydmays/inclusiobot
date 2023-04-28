import * as dotenv from 'dotenv';

dotenv.config();

/** A map of roles by SKU. */
export const ROLE_BY_SKU: Record<string, string> = Object.fromEntries(
  process.env.SKU_ROLES?.split(';').map((e) => {
    const pair = e!.split(':');
    return [pair[0], pair[1]];
  }) || [],
);
