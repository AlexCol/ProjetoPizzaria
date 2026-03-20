using csharp_p2.src.Modules.Domain.Products;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;

namespace csharp_p2.src.Modules.Domain;

public interface IOrderItemsService {
  Task<List<OrderItem>> GetItensFromOrderId(long orderId);
  Task UpsertOrderItemAsync(long orderId, List<UpsertOrderItemsDto> orderItems);
  Task DeleteOrderItemAsync(long orderItemId);
}

public class OrderItemsService(
  IGenericEntityRepository<OrderItem> orderItemsRepository,
  IGenericEntityRepository<Order> ordersRepository,
  IProductsService productsService
) : IOrderItemsService {

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  #region Gets
  public async Task<List<OrderItem>> GetItensFromOrderId(long orderId) {
    var items = await orderItemsRepository.SearchWithPredicateWithReferencesAsync(oi => oi.OrderId == orderId);
    return items.ToList();
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE/UPDATE
  #region Create/Update
  public async Task UpsertOrderItemAsync(long orderId, List<UpsertOrderItemsDto> orderItems) {
    await IsOrderDraftOrThrowAsync(orderId);
    await ThrowIfProductInactiveAsync(orderItems);

    using var trx = await orderItemsRepository.BeginTransactionAsync();
    try {
      var existingItems = await orderItemsRepository.SearchWithPredicateAsync(oi => oi.OrderId == orderId);

      foreach (var item in orderItems) {
        var existingItem = existingItems.FirstOrDefault(e => e.ProductId == item.ProductId);
        if (existingItem is null) {
          await CreateOrderItemAsync(orderId, item);
          continue;
        }

        ValidateNewAmountOrThrow(existingItem, item);
        await UpdateOrderItemAsync(existingItem, item);
      }

      await trx.CommitAsync();
    } catch (Exception ex) {
      await trx.RollbackAsync();
      ThrowIfProductNotFoundError(ex);
      throw new CustomError($"Error upserting order items: {ex.Message}", 500);
    }
  }

  private async Task CreateOrderItemAsync(long orderId, UpsertOrderItemsDto item) {
    var newItem = new OrderItem {
      Amount = item.Amount,
      OrderId = orderId,
      ProductId = item.ProductId
    };
    await orderItemsRepository.InsertAsync(newItem);
  }

  private void ValidateNewAmountOrThrow(OrderItem existingItem, UpsertOrderItemsDto item) {
    if (existingItem.Amount + item.Amount <= 0) {
      throw new CustomError("New Amount can't be lower or Equal than Current Amount. To exclude use the Exclude Item Option.");
    }
  }

  private async Task UpdateOrderItemAsync(OrderItem existingItem, UpsertOrderItemsDto item) {
    existingItem.Amount += item.Amount;
    await orderItemsRepository.UpdateAsync(existingItem);
  }

  private async Task ThrowIfProductInactiveAsync(List<UpsertOrderItemsDto> orderItems) {
    if (orderItems.Count == 0) return;

    var productIds = orderItems.Select(oi => oi.ProductId).ToList();
    var inactiveProducts = await productsService.GetAllProductsAsync(EProductStatus.Inactive);
    var disabledProductOnOrder = inactiveProducts.Any(p => orderItems.Any(oi => oi.ProductId == p.Id));

    if (disabledProductOnOrder) {
      throw new CustomError("One or more products in the order are currently inactive.", 400);
    }
  }

  private void ThrowIfProductNotFoundError(Exception ex) {
    if (ex.Message.Contains("FK_ORDER_ITEMS_PRODUCTS_PRODUCT_ID")) {
      throw new CustomError("One or more products in the order do not exist.", 400);
    }
    if (ex.InnerException != null && ex.InnerException.Message.Contains("FK_ORDER_ITEMS_PRODUCTS_PRODUCT_ID")) {
      throw new CustomError("One or more products in the order do not exist.", 400);
    }
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  #region Delete
  public async Task DeleteOrderItemAsync(long orderItemId) {
    var orderItem = await orderItemsRepository.FindOneWithPredicateAsync(oi => oi.Id == orderItemId);
    if (orderItem == null) throw new CustomError("Order item not found", 404);

    await IsOrderDraftOrThrowAsync(orderItem.OrderId);
    await orderItemsRepository.DeleteAsync(orderItemId);
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!PRIVATES
  #region Privates
  private async Task IsOrderDraftOrThrowAsync(long orderId) {
    var order = await ordersRepository.FindOneWithPredicateAsync(oi => oi.Id == orderId);
    if (order == null) throw new CustomError("Order not found", 404);

    if (order.Status != EOrderStatus.Draft) {
      throw new CustomError("Only items from orders in draft status can be added, modified or deleted.");
    }
  }
  #endregion
}
