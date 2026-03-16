using csharp_p2.src.Modules.Sse;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.Pagination;

namespace csharp_p2.src.Modules.Domain;

public interface IOrdersService {
  Task<Order> GetOrderByIdAsync(long id);
  Task<PaginatedResult<Order>> GetAllOrdersAsync(SearchCriteriaRequest<Order> searchCriteria);
  Task<Order> CreateOrderAsync(long userId, CreateOrderDto order);
  Task<string> UpdateOrderStatusAsync(long id, UpdateOrderStatusDto orderStatus);
  Task<string> UpdateOrderAsync(long id, UpdateOrderDto orderStatus);
  Task DeleteOrderAsync(long id);
}

public class OrdersService(
  IGenericEntityRepository<Order> ordersRepository,
  IGenericEntityRepository<OrderItem> orderItemsRepository,
  IServiceScopeFactory scopeFactory
) : IOrdersService {
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<Order> GetOrderByIdAsync(long id) {
    var orders = await ordersRepository.GetByIdAsync(id);
    if (orders == null) throw new CustomError("Order not found", 404);

    var orderItems = await orderItemsRepository.FindOneWithPredicateAsync(oi => oi.OrderId == id);

    orders.OrderItems = orderItems != null ? [orderItems] : [];
    return orders;
  }

  public async Task<PaginatedResult<Order>> GetAllOrdersAsync(SearchCriteriaRequest<Order> searchCriteria) {
    var orders = await ordersRepository.GetWithSearchCriteriaAsync(searchCriteria);
    return orders;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<Order> CreateOrderAsync(long userId, CreateOrderDto order) {
    var openOrderOnTable = await ordersRepository.FindOneWithPredicateAsync(o => o.TableNumber == order.TableNumber && o.Status != (int)EOrderStatus.Done);
    if (openOrderOnTable != null) {
      throw new CustomError("There is already an open order on this table.", 400);
    }

    try {
      var newOrder = new Order {
        TableNumber = order.TableNumber,
        Name = order.Name,
        UserId = userId,
        OrderItems = [.. order.OrderItems.Select(oi => new OrderItem { Amount = oi.Amount, ProductId = oi.ProductId })]
      };
      var createdOrder = await ordersRepository.InsertAsync(newOrder);
      return createdOrder;
    } catch (Exception ex) {
      ThrowIfProductNotFoundError(ex);
      throw new CustomError($"Error creating order: {ex.Message}", 500);
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

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  //? update status only
  public async Task<string> UpdateOrderStatusAsync(long id, UpdateOrderStatusDto orderStatus) {
    var order = await GetOrderByIdOrThrowAsync(id);

    if (Math.Abs(order.Status - (int)orderStatus.Status) != 1) {
      throw new CustomError("Invalid status transition. Status can only be updated to the next sequential status.");
    }

    order.Status = (int)orderStatus.Status;
    await ordersRepository.UpdateAsync(order);

    await SendOrderStatusChangeNotificationAsync(order);

    return $"Order with id {id} updated successfully.";

  }

  //? update order details (table number and name)
  public async Task<string> UpdateOrderAsync(long id, UpdateOrderDto orderDto) {
    var order = await GetOrderByIdOrThrowAsync(id);
    await ValidateUpdateOrderAsync(order, orderDto);
    SetValuesForOrderUpdateOrThrow(order, orderDto);
    await ordersRepository.UpdateAsync(order);
    return $"Order with id {id} updated successfully.";
  }

  //+ validations
  private async Task ValidateUpdateOrderAsync(Order order, UpdateOrderDto orderDto) {
    if (order.Status != (int)EOrderStatus.Draft) {
      throw new CustomError("Only orders in Draft status can be updated.");
    }

    if (orderDto.TableNumber != 0) {
      var openOrderOnTable = await ordersRepository.FindOneWithPredicateAsync(o =>
        o.TableNumber == orderDto.TableNumber && o.Status != (int)EOrderStatus.Done && o.Id != order.Id
      );
      if (openOrderOnTable != null) {
        throw new CustomError("There is already an open order on this table.");
      }
    }
  }

  //+ prepare data for update
  private void SetValuesForOrderUpdateOrThrow(Order order, UpdateOrderDto orderDto) {
    var updateOrder = false;

    if (orderDto.TableNumber != 0) {
      order.TableNumber = orderDto.TableNumber;
      updateOrder = true;
    }

    if (!string.IsNullOrEmpty(orderDto.Name)) {
      order.Name = orderDto.Name;
      updateOrder = true;
    }

    if (!updateOrder) {
      throw new CustomError("No valid fields provided for update.", 400);
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  public async Task DeleteOrderAsync(long id) {
    var order = await GetOrderByIdOrThrowAsync(id);

    if (order.Status != (int)EOrderStatus.Draft) {
      throw new CustomError("Only orders in Draft status can be deleted.");
    }

    await ordersRepository.DeleteAsync(id);
  }

  private async Task<Order> GetOrderByIdOrThrowAsync(long id) {
    var order = await ordersRepository.GetByIdAsync(id);
    if (order == null) throw new CustomError("Order not found", 404);
    return order;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!NOTIFICATIONS
  private async Task SendOrderStatusChangeNotificationAsync(Order order) {
    if (order.UserId == 0) return; //? if userId is not set, skip notification

    _ = Task.Run(async () => {
      using var scope = scopeFactory.CreateScope();
      try {
        var sseService = scope.ServiceProvider.GetRequiredService<ISseService>();
        await sseService.SendToUserAsync(order.UserId.ToString(), ESseEvents.OrderStatusChanged, null);
      } catch (Exception ex) {
        Log.Error("Error sending session update notification: " + ex.Message);
      }
    });
  }
}
