namespace csharp_p2.src.Modules.Domain;

public interface IOrderItemsService {
  Task<List<OrderItem>> GetItensFromOrderId(long orderId);
}

public class OrderItemsService(
  IGenericEntityRepository<OrderItem> orderItemsRepository
) : IOrderItemsService {
  public async Task<List<OrderItem>> GetItensFromOrderId(long orderId) {
    var items = await orderItemsRepository.SearchWithPredicateWithReferencesAsync(oi => oi.OrderId == orderId);
    return [.. items];
  }
}
