import { Controller, Get, Req } from '@nestjs/common';
import { AdminRequest } from '../shopify/interface/request.interface';

@Controller('admin')
export class AdminController {
  @Get()
  async getSomeValue(@Req() request: AdminRequest) {
    const { shop } = request.session;
  }
}
