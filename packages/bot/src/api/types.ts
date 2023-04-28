export declare interface WpSubscription {
  id: string;
  mlc_community_user_id: string;
  mlc_subscription_sku: string;
  mlc_subscription_name: string;
  meta_data: Array<WpMetadata>;
}

export declare interface WpMetadata {
  id: number;
  key: string;
  value: string;
}
