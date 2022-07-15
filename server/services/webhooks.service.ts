import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  // This is the method that will really handle what to do with each webhook received.
  async handleWebhookRequest(
    topic: string,
    shop: string,
    webhookRequestBody: string,
  ) {
    // switch (topic) {
    // case 'customers/delete':
    // logic for handling customer deletion
    // }
  }
}
