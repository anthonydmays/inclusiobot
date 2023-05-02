export declare interface WpSubscription {
  id: number;
  customer_id: number;
  mlc_community_user_id?: string;
  mlc_community_username?: string;
  mlc_subscription_sku?: string;
  mlc_subscription_name?: string;
  mlc_subscription_active?: boolean;
}

export declare interface WpMetadata {
  id: number;
  key: string;
  value: string;
}
