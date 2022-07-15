import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Shop extends Document {
  @Prop({ required: true, index: { unique: true } })
  id: string;

  @Prop({ required: true, index: { unique: true } })
  shop: string;

  @Prop({ type: String })
  accessToken: string;

  @Prop({ type: String })
  scope: string;

  @Prop({ type: Date })
  expires: Date;

  @Prop({ type: Boolean })
  isOnline: boolean;

  @Prop({ type: String })
  state: string;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
