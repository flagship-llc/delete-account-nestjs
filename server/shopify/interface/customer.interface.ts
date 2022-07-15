export interface Customer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number;
  note?: any;
  verified_email: boolean;
  multipass_identifier?: any;
  tax_exempt: boolean;
  phone?: any;
  tags: string;
  last_order_name: string;
  currency: string;
  addresses: Address[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level?: any;
  admin_graphql_api_id: string;
  default_address: Address;
}

interface Address {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}
