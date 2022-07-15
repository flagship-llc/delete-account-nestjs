export class ShopDTO {
  id: string;
  shop: string;
  accessToken: string;
  scope: string;
  expires: Date;
  isOnline: boolean;
  state: string;

  constructor() {}
}
