import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { EOrderStatus, GetApiOrdersParams, Order, OrderItem } from '../../../../api/generated/models';
import { OrderItemsService } from '../../../../api/generated/order-items/order-items.service';
import { OrdersService } from '../../../../api/generated/orders/orders.service';
import { DataTableQuery } from '../../../../components/shared/data-table/data-table.interfaces';
import { getApiErrorMessage } from '../../../../models/ApiError';

type OrdersSearchParams = GetApiOrdersParams & Record<string, string | number>;

@Injectable()
export class HomeDataService {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly ordersService = inject(OrdersService);
  private readonly orderItemsService = inject(OrderItemsService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private currentQuery: DataTableQuery = {
    page: 1,
    limit: 10,
    sortField: 'CreatedAt',
    sortOrder: 'desc',
    filters: [],
  };

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly orders = signal<Order[]>([]);
  readonly orderItems = signal<OrderItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly loadingItems = signal(false);
  readonly updatingStatus = signal(false);

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  load(): void {
    this.loadOrders();
  }

  changeQuery(query: DataTableQuery): void {
    this.currentQuery = query;
    this.loadOrders();
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  loadOrderItems(order: Order): void {
    if (order.id === undefined || order.id === null) {
      this.orderItems.set([]);
      this.toast.error('Pedido inválido.', 'Erro');
      return;
    }

    this.loadingItems.set(true);
    this.orderItemsService
      .getApiOrderItemsOrderId(order.id)
      .pipe(
        finalize(() => this.loadingItems.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => this.orderItems.set(items),
        error: (error: HttpErrorResponse) => {
          this.orderItems.set([]);
          if (error.status !== 404) {
            this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os itens do pedido.'), 'Erro');
          }
        },
      });
  }

  clearOrderItems(): void {
    this.orderItems.set([]);
  }

  markOrderAsReady(order: Order, onSuccess: () => void): void {
    if (order.id === undefined || order.id === null) {
      this.toast.error('Pedido inválido.', 'Erro');
      return;
    }

    this.updatingStatus.set(true);
    this.ordersService
      .patchApiOrdersStatusId(order.id, { status: EOrderStatus.Done })
      .pipe(
        finalize(() => this.updatingStatus.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success('Pedido marcado como pronto.');
          onSuccess();
          this.loadOrders();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível atualizar o pedido.'), 'Erro');
        },
      });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private loadOrders(): void {
    this.loading.set(true);
    this.ordersService
      .getApiOrders(this.toSearchParams(this.currentQuery))
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.orders.set(response.data);
          this.total.set(Number(response.total ?? 0));
        },
        error: (error: HttpErrorResponse) => {
          this.orders.set([]);
          this.total.set(0);
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os pedidos.'), 'Erro');
        },
      });
  }

  private toSearchParams(query: DataTableQuery): OrdersSearchParams {
    const params: OrdersSearchParams = {
      page: query.page,
      limit: query.limit,
    };

    if (query.sortField) params['sort-field'] = query.sortField;
    if (query.sortOrder) params['sort-order'] = query.sortOrder;

    for (const filter of query.filters) {
      params[filter.field] = filter.value;
    }

    // A cozinha acompanha somente pedidos que já foram enviados para preparo.
    params['Status'] = EOrderStatus.Pending;

    return params;
  }
}
