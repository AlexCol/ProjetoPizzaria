import { Component, DestroyRef, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { Eye, LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { EOrderStatus, Order } from '../../../../api/generated/models';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table';
import {
  DataTableCellTemplateContext,
  DataTableQuery,
} from '../../../../components/shared/data-table/data-table.interfaces';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { SSEService } from '../../../../services/sse/sse.service';
import { HomeDataService } from './home-data.service';
import { createHomeTableColumns } from './home-table.columns';
import { homeStyles } from './home.styles';
import { PedidoModalComponent } from './pedido-modal/pedido-modal';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  host: { '[class]': 'styles.host' },
  imports: [ButtonComponent, DataTableComponent, LucideAngularModule, ModalComponent, PedidoModalComponent],
  providers: [HomeDataService],
})
export class HomeComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly data = inject(HomeDataService);
  private readonly sseService = inject(SSEService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private refreshAfterModalClose = false;

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly Eye = Eye;
  readonly orders = this.data.orders;
  readonly orderItems = this.data.orderItems;
  readonly total = this.data.total;
  readonly loading = this.data.loading;
  readonly loadingItems = this.data.loadingItems;
  readonly updatingStatus = this.data.updatingStatus;
  readonly modalOpen = signal(false);
  readonly selectedOrder = signal<Order | undefined>(undefined);
  readonly styles = homeStyles;

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly statusTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<Order>>>('statusTemplate');
  readonly actionsTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<Order>>>('actionsTemplate');
  readonly tableColumns = computed(() =>
    createHomeTableColumns({
      statusTemplate: this.statusTemplate(),
      actionsTemplate: this.actionsTemplate(),
    }),
  );

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    this.data.load();
    this.registerSseListener();
    this.destroyRef.onDestroy(() => this.sseService.unregisterCommand('kitchen-orders-changed'));
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  handleTableQuery(query: DataTableQuery): void {
    this.data.changeQuery(query);
  }

  openOrder(order: Order): void {
    this.selectedOrder.set(order);
    this.modalOpen.set(true);
    this.data.loadOrderItems(order);
  }

  closeOrder(): void {
    this.modalOpen.set(false);
  }

  handleOrderModalClosed(): void {
    this.selectedOrder.set(undefined);
    this.data.clearOrderItems();

    if (this.refreshAfterModalClose) {
      this.refreshAfterModalClose = false;
      this.data.refreshOrders();
    }
  }

  markSelectedOrderAsReady(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.data.markOrderAsReady(order, () => {
      this.refreshAfterModalClose = false;
      this.closeOrder();
    });
  }

  statusLabel(status: Order['status']): string {
    return {
      Draft: 'Rascunho',
      Pending: 'Em preparo',
      Done: 'Pronto',
      Finalized: 'Finalizado',
    }[status ?? EOrderStatus.Draft];
  }

  statusClass(status: Order['status']): string {
    return {
      Draft: this.styles.draftBadge,
      Pending: this.styles.pendingBadge,
      Done: this.styles.doneBadge,
      Finalized: this.styles.finalizedBadge,
    }[status ?? EOrderStatus.Draft];
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private registerSseListener(): void {
    this.sseService.registerCommand('kitchen-orders-changed', {
      onMessage: (data) => this.handleKitchenOrdersChanged(data),
    });
  }

  private handleKitchenOrdersChanged(data?: { Status?: string; status?: string }): void {
    const status = data?.Status ?? data?.status;

    if (status === EOrderStatus.Pending) {
      this.toast.info('Um novo pedido foi enviado para preparo.', 'Novo pedido');
    }

    if (this.modalOpen()) {
      this.refreshAfterModalClose = true;
      return;
    }

    this.data.refreshOrders();
  }
}
