import { Request } from 'express';
import { Session } from '@shopify/shopify-api/dist/auth/session';

export interface AdminRequest extends Request {
  session: Session;
}
