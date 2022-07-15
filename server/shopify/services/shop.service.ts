import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ShopDTO } from '../dto/shop.dto';
import { Shop } from '../schemas/shop.schema';

@Injectable()
export class ShopService {
  constructor(@InjectModel(Shop.name) private shopModel: Model<Shop>) {}

  async getAll(): Promise<Array<ShopDTO>> {
    const shops = await this.shopModel.find({}).exec();
    return shops;
  }

  async getByDomain(shopify_domain: string): Promise<ShopDTO> {
    const shop = await this.shopModel.findOne({ shop: shopify_domain }).exec();
    return shop;
  }

  async addOrUpdate(shop: ShopDTO): Promise<ShopDTO> {
    const newShop = this.shopModel
      .findOneAndUpdate(
        { shop: shop.shop },
        { ...shop },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      )
      .exec();
    return newShop;
  }

  async deleteByDomain(shop: ShopDTO): Promise<void> {
    await this.shopModel.deleteOne({ shop: shop.shop }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    await this.shopModel.deleteOne({ id: id }).exec();
    return true;
  }

  async getToken(shopifyDomain: string): Promise<string> {
    const shop = await this.shopModel.findOne({ shop: shopifyDomain }).exec();
    return shop.accessToken;
  }

  async getById(id: string): Promise<ShopDTO> {
    const shop = await this.shopModel.findOne({ id: id }).exec();
    return shop;
  }
}
