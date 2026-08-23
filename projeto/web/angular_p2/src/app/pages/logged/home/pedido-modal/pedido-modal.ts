import { Component, computed, input, output } from '@angular/core';
import { EOrderStatus, Order, OrderItem } from '../../../../../api/generated/models';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { pedidoModalStyles } from './pedido-modal.styles';

@Component({
  selector: 'app-pedido-modal',
  templateUrl: './pedido-modal.html',
  host: { '[class]': 'styles.host' },
  imports: [ButtonComponent],
})
export class PedidoModalComponent {
  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = pedidoModalStyles;

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly order = input.required<Order>();
  readonly items = input.required<readonly OrderItem[]>();
  readonly loading = input(false);
  readonly updatingStatus = input(false);
  readonly closeModal = output<void>();
  readonly markAsReady = output<void>();

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly canMarkAsReady = computed(() => this.order().status === EOrderStatus.Pending);
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + Number(item.amount ?? 0) * Number(item.product?.price ?? 0), 0),
  );

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  close(): void {
    this.closeModal.emit();
  }

  ready(): void {
    this.markAsReady.emit();
  }

  statusLabel(): string {
    return {
      Draft: 'Rascunho',
      Pending: 'Em preparo',
      Done: 'Pronto',
      Finalized: 'Finalizado',
    }[this.order().status ?? EOrderStatus.Draft];
  }

  statusClass(): string {
    return {
      Draft: this.styles.draftBadge,
      Pending: this.styles.pendingBadge,
      Done: this.styles.doneBadge,
      Finalized: this.styles.finalizedBadge,
    }[this.order().status ?? EOrderStatus.Draft];
  }

  formatCurrency(value: number | string | undefined): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
  }

  itemSubtotal(item: OrderItem): string {
    return this.formatCurrency(Number(item.amount ?? 0) * Number(item.product?.price ?? 0));
  }

  createdAtLabel(): string {
    const createdAt = this.order().createdAt;
    return createdAt
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(createdAt))
      : 'Não informado';
  }
}
