import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, OrderEvent } from './order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  createOrder(@Body('id') id: string): Order {
    return this.orderService.createOrder(id);
  }

  @Post(':id/event/:event')
  async transitionOrder(
    @Param('id') id: string,
    @Param('event') event: string,
  ): Promise<Order> {
    return await this.orderService.transitionOrder(id, {
      type: event.toUpperCase(),
    } as OrderEvent);
  }

  @Get(':id')
  getOrder(@Param('id') id: string): Order {
    return this.orderService.getOrder(id);
  }

  @Get()
  getAllOrders(): Order[] {
    return this.orderService.getAllOrders();
  }
}
