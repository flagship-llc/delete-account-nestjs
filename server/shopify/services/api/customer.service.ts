import { Injectable, Logger } from '@nestjs/common';
import { ApiService } from './api.service';
import { ShopDTO } from '../../dto/shop.dto';
import { Customer } from '../../interface/customer.interface';

@Injectable()
export class CustomerService extends ApiService {
  logger: Logger = new Logger(CustomerService.name);

  async getCustomerWithRestAPI(
    shop: ShopDTO,
    customerId: number,
  ): Promise<[Customer, string]> {
    const { data, link } = await this.callRestApi(
      shop,
      'get',
      `/customers/${customerId}.json`,
      null,
      this.logger,
    );
    return [data.customer, link];
  }

  async searchCustomersWithRestAPI(
    shop: ShopDTO,
    queryData: { query?: string; limit?: number; startingLink?: string },
  ): Promise<[Customer[], string]> {
    const { query, limit, startingLink } = queryData;
    let queryLimit = limit;
    if (!limit) queryLimit = 250;
    let queryString = query;
    if (!query) queryString = '';
    let endpoint = startingLink
      ? startingLink
      : `customers/search.json?limit=${queryLimit}${queryString}`;
    const { data, link } = await this.callRestApi(
      shop,
      'get',
      endpoint,
      null,
      this.logger,
    );
    this.logger.log(`${data.customers.length} customers retrieved`);
    return [data.customers, link];
  }

  async findCustomerByEmail(shop: ShopDTO, email: string) {
    const query = `customers(first: 5, email: ${email}){
      email
      id
    }`;
    const body = {
      query: query,
      variables: null,
      operation_name: 'query',
    };
    const customers = await this.callGraphQlApi(shop, body, this.logger);
    const customer = customers.find((c) => c.email === email);
    if (!customer) throw 'customer not found';

    return customer.id.replace('gid://shopify/Customer/', '');
  }
}
