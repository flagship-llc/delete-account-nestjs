import { Document } from 'mongoose';

export interface Shop extends Document {
  readonly _id: string;
  readonly id: string;
  readonly shop: string;
  readonly accessToken: string;
  readonly scope: string;
  readonly expires: Date;
  readonly isOnline: boolean;
  readonly state: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}
