/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  createActor,
  assign,
  createMachine,
  MachineConfig,
  waitFor,
} from 'xstate';
import { Order, OrderEvent } from './order.entity';

interface OrderContext {
  order: Order;
}

const orderMachineConfig: MachineConfig<OrderContext, any, any, OrderEvent> = {
  id: 'order',
  initial: 'created',
  context: ({ input }) => ({ order: input.order }),
  states: {
    created: {
      on: {
        PAY: {
          target: 'paid',
          actions: assign({
            order: (input) => ({
              id: input.context.order.id,
              state: 'paid',
              createdAt: input.context.order.createdAt,
              updatedAt: new Date(),
            }),
          }),
        },
      },
    },
    paid: {
      on: {
        SHIP: {
          target: 'shipped',
          actions: assign({
            order: (input) => ({
              id: input.context.order.id,
              state: 'shipped',
              createdAt: input.context.order.createdAt,
              updatedAt: new Date(),
            }),
          }),
        },
      },
    },
    shipped: {
      on: {
        FINALIZE: {
          target: 'finalized',
          actions: assign({
            order: (input) => ({
              id: input.context.order.id,
              state: 'finalized',
              createdAt: input.context.order.createdAt,
              updatedAt: new Date(),
            }),
          }),
        },
      },
    },
    finalized: {
      type: 'final',
    },
  },
};

@Injectable()
export class OrderService {
  private orders: Map<string, Order> = new Map();
  private orderStateMachine;

  constructor() {
    this.orderStateMachine = createMachine(orderMachineConfig);
  }

  createOrder(id: string): Order {
    const order = new Order(id);
    this.orders.set(id, order);
    return order;
  }

  // private sendAndWaitForState = async (
  //   actor: any,
  //   event: OrderEvent,
  // ): Promise<Order> => {
  //   let timeout: NodeJS.Timeout;

  //   return new Promise((resolve, reject) => {
  //     const previousSnapshot = actor.getSnapshot();
  //     console.log('=> OLD State:', previousSnapshot.value);

  //     let settled = false; // Flag to track if promise is settled

  //     const unsubscribe = actor.subscribe((state) => {
  //       if (settled) return; // Skip if already settled
  //       console.log('=> New State:', state.value);

  //       // Clear the timeout if the state change happens
  //       if (timeout) {
  //         clearTimeout(timeout);
  //       }

  //       if (previousSnapshot.value === state.value) {
  //         settled = true; // Mark promise as settled
  //         console.warn(
  //           `Event '${event.type}' is invalid for current state '${state.value}'`,
  //         );
  //         unsubscribe.unsubscribe();
  //         return reject(
  //           new Error(
  //             `Event '${event.type}' cannot be applied in state '${state.value}'`,
  //           ),
  //         );
  //       }

  //       settled = true; // Mark promise as settled
  //       console.log('=> State:', state.value);
  //       console.log('=> Context:', state.context);
  //       unsubscribe.unsubscribe();
  //       return resolve(state.context.order);
  //     });

  //     actor.send(event);

  //     // Initialize timeout after actor is sent an event
  //     timeout = setTimeout(() => {
  //       if (settled) return; // Skip if already settled
  //       settled = true; // Mark promise as settled
  //       console.error(
  //         `Timeout: Event '${event.type}' did not trigger a state change within 1 second.`,
  //       );
  //       unsubscribe.unsubscribe();
  //       return reject(
  //         new Error(
  //           `Timeout: Event '${event.type}' did not trigger a state change.`,
  //         ),
  //       );
  //     }, 1000);
  //   });
  // };

  async transitionOrder(id: string, event: OrderEvent): Promise<Order> {
    const foundOrder = this.orders.get(id);
    if (!foundOrder) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    const service = this.initStateMachine(foundOrder);

    // const response = await this.sendAndWaitForState(service, event);

    service.send(event);

    try {
      return await this.resolveEvent(service, foundOrder, id);
    } catch (error) {
      console.log('=>Error:', error);
      throw new Error(error);
    }
  }

  private async resolveEvent(service, foundOrder: Order, id: string) {
    const response = await waitFor(
      service,
      (value) => {
        return value.context.order.state !== foundOrder.state;
      },
      { timeout: 10 },
    );

    this.orders.set(id, response.context.order);

    return response.context.order;
  }

  private initStateMachine(foundOrder: Order) {
    const resolvedState = this.orderStateMachine.resolveState({
      value: foundOrder.state,
      context: { order: foundOrder },
    });

    const service = createActor(this.orderStateMachine, {
      state: resolvedState,
    }).start();
    return service;
  }

  getOrder(id: string): Order {
    const order = this.orders.get(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return order;
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }
}
