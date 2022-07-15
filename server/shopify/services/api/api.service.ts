import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ShopDTO } from '../../dto/shop.dto';
import * as https from 'https';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { sleep } from '../../../helpers/sleepHelper';

@Injectable()
export class ApiService {
  constructor(private readonly configService: ConfigService) {}
  apiVersion: string = this.configService.get('shopifyApiVersion');

  async callRestApi(
    shop: ShopDTO,
    method: 'post' | 'get' | 'put' | 'delete',
    endpoint: string,
    data: object | null,
    logger: Logger,
  ) {
    let retries = 0;
    let response;
    const headers = {
      'X-Shopify-Access-Token': shop.accessToken,
      'Content-Type': 'application/json',
    };
    const url = `https://${shop.shop}/admin/api/${this.apiVersion}/${endpoint}`;
    let link = null;
    while (true) {
      try {
        const request: {
          headers: {
            'X-Shopify-Access-Token': string;
            'Content-Type': string;
          };
          method: 'post' | 'get' | 'put' | 'delete';
          url: string;
          data?: object;
        } = {
          headers,
          method: method,
          url: url,
        };
        if (data) request.data = data;
        response = await axios(request);
        if (response.headers.link) {
          const linkHeader = response.headers.link.toString();
          if (linkHeader.indexOf('rel="next"') !== -1) {
            link = linkHeader;
            if (link.indexOf(',') !== -1) {
              link = link.split(',');
              link = link[1];
            }
            link = link.slice(link.indexOf('<') + 1, link.indexOf('>'));
            link = link.replace(
              `https://${shop.shop}/admin/api/${this.apiVersion}/`,
              '',
            );
          }
        }
        return { data: response.data, link: link };
      } catch (e) {
        retries += 1;
        await sleep(4000);
        if (e.response) {
          console.log(e.response);
        }
        logger.error(`Rest API error: ${JSON.stringify(e)}`);
        if (retries > 10) {
          throw 'Shopify API エラー';
        }
      }
    }
  }

  async callGraphQlApi(
    shop: ShopDTO,
    body: {
      query: string;
      variables: object | null;
      operation_name: string;
    },
    logger: Logger,
  ) {
    let retries = 0;
    let response;
    while (true) {
      try {
        const headers = {
          'X-Shopify-Access-Token': shop.accessToken,
          'Content-Type': 'application/json',
        };
        const StringBody = JSON.stringify(body);
        response = await axios({
          method: 'post',
          url: `https://${shop.shop}/admin/api/${this.apiVersion}/graphql.json`,
          data: StringBody,
          headers: headers,
        });
        if (response.data.errors) throw response.data.errors;
        if (response.data.data) {
          if (response.data.data.errors) {
            if (response.data.data.errors.length > 0) {
              throw JSON.stringify(response.data.data.errors);
            }
          }
          if (response.data.data.bulkOperationRunQuery) {
            if (
              response.data.data.bulkOperationRunQuery.userErrors.length > 0
            ) {
              throw JSON.stringify(
                response.data.data.bulkOperationRunQuery.userErrors,
              );
            }
          }
        }

        const responseHeaders = response.headers;
        console.log('X-Request-ID: ', responseHeaders['x-request-id']);
        return response.data.data;
      } catch (e) {
        retries += 1;
        await sleep(4000);
        if (e.response) {
          logger.error(e.response);
        }
        if (retries > 10) {
          logger.error(e);
          throw 'Shopify API エラー';
        }
      }
    }
  }

  performBulkQuery(
    query: string,
    shop: ShopDTO,
    pollingInterval: number,
    logger: Logger,
  ) {
    return new Promise(async (resolve, reject) => {
      let retries = 0;
      const completeQuery = `mutation {
        bulkOperationRunQuery(
          query: """
          {
          ${query}
          }
          """
        ) {
          bulkOperation {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }`;
      const variables = null;
      const operationName = 'query';

      const body = {
        query: completeQuery,
        variables: variables,
        operation_name: operationName,
      };
      while (true) {
        try {
          await this.callGraphQlApi(shop, body, logger);
          const url = await this.pollBulkQuery(shop, pollingInterval, logger);
          const file = await this.downloadBulkQueryFile(url);
          resolve(file);
          break;
        } catch (e) {
          if (e === 'No orders found') {
            if (!fs.existsSync('./tmp')) {
              fs.mkdirSync('./tmp');
            }
            await new Promise<void>((resolve) =>
              fs.writeFile('./tmp/query-results.txt', '', null, () =>
                resolve(),
              ),
            );
            resolve('./tmp/query-results.txt');
            break;
          }
          logger.error('Bulk query error: ' + e);
          if (retries > 5) {
            reject(e);
            break;
          }
          retries++;
        }
      }
    });
  }

  pollBulkQuery(
    shop: ShopDTO,
    pollingInterval: number,
    logger: Logger,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const variables = null;
      const operationName = 'query';

      const body = {
        query: '',
        variables: variables,
        operation_name: operationName,
      };
      while (true) {
        try {
          body.query = `{
            currentBulkOperation {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
            }
          }`;
          const response = await this.callGraphQlApi(shop, body, logger);
          logger.log(
            'Bulk query polling response: ' + JSON.stringify(response),
          );
          const status = response.currentBulkOperation.status;
          const objectCount = response.currentBulkOperation.objectCount;
          if (
            status === 'CANCELING' ||
            status === 'CANCELED' ||
            status === 'EXPIRED' ||
            status === 'FAILED'
          ) {
            throw `status is ${status}`;
          }
          if (status === 'COMPLETED') {
            logger.log('Total object count: ' + objectCount);
            if (response.currentBulkOperation.url) {
              resolve(response.currentBulkOperation.url);
            } else {
              throw 'No orders found';
            }
            break;
          } else {
            logger.log('Current object count: ' + objectCount);
            await sleep(pollingInterval);
          }
        } catch (e) {
          reject(e);
          break;
        }
      }
    });
  }

  downloadBulkQueryFile(url: string) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync('./tmp')) {
        fs.mkdirSync('./tmp');
      }
      const file = fs.createWriteStream('./tmp/query-results.txt');
      https
        .get(url, (response) => {
          response.pipe(file);
          file.on('finish', function () {
            file.close();
            resolve('./tmp/query-results.txt');
          });
        })
        .on('error', (e) => {
          fs.unlink('./tmp/query-results.txt', () => {
            reject(e);
          });
        });
    });
  }
}
