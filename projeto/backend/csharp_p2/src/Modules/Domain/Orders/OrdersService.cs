namespace csharp_p2.src.Modules.Domain;

public interface IOrdersService {
  // Task<IEnumerable<Order>> GetAllOrdersAsync(int page, int pageSize);
  // Task<Order> GetOrderByIdAsync(long id);
  // Task<string> CreateOrderAsync(CreateOrderDto order);
  // Task<string> UpdateOrderAsync(long id, UpdateOrderDto order);
  // Task DeleteOrderAsync(long id);
}

public class OrdersService : IOrdersService {
  private readonly IGenericEntityRepository<Order> _ordersRepository;

  public OrdersService(IGenericEntityRepository<Order> ordersRepository) {
    _ordersRepository = ordersRepository;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE

}
