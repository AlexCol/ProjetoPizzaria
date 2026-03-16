using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Pagination;

namespace csharp_p2.src.Modules.Domain.Orders;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase {
  private readonly IOrdersService _ordersService;

  public OrdersController(IOrdersService ordersService) {
    _ordersService = ordersService;
  }

  [HttpGet("{id}", Name = "GetOrderById")]
  [EndpointSummary("Obter Pedido por ID")]
  [EndpointDescription("Retorna um pedido pelo seu ID.")]
  [ProducesResponseType(typeof(Order), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(void), StatusCodes.Status404NotFound)]
  public async Task<IActionResult> GetOrderByIdAsync(long id) {
    var order = await _ordersService.GetOrderByIdAsync(id);
    if (order == null) return NotFound();
    return Ok(order);
  }

  [HttpGet]
  [EndpointSummary("Obter Todos os Pedidos com Filtros na Query.")]
  [EndpointDescription("Retorna uma lista de todos os pedidos, aplicando filtros enviados na query.")]
  [ProducesResponseType(typeof(PaginatedResult<Order>), StatusCodes.Status200OK)]
  public async Task<IActionResult> GetAllOrdersAsync([FromQuery] SearchCriteriaRequest<Order> searchCriteria) {
    var orders = await _ordersService.GetAllOrdersAsync(searchCriteria);
    return Ok(orders);
  }

  [HttpPost]
  [EndpointSummary("Criar um Novo Pedido")]
  [EndpointDescription("Cria um novo pedido com os detalhes fornecidos.")]
  [ProducesResponseType(StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> CreateOrderAsync([FromBody] CreateOrderDto order) {
    var session = HttpContext.GetSessionPayload();
    var userId = session.User.Id;
    var result = await _ordersService.CreateOrderAsync(userId, order);
    return CreatedAtAction("GetOrderById", new { id = result.Id }, result);
  }

  [HttpPatch("status/{id}")]
  [EndpointSummary("Atualizar o Status de um Pedido")]
  [EndpointDescription("Atualiza o status de um pedido existente.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> UpdateOrderStatusAsync(long id, [FromBody] UpdateOrderStatusDto orderStatus) {
    var result = await _ordersService.UpdateOrderStatusAsync(id, orderStatus);
    return Ok(new MessageDto(result));
  }

  [HttpDelete("{id}")]
  [EndpointSummary("Deletar um Pedido")]
  [EndpointDescription("Deleta um pedido pelo seu ID.")]
  [ProducesResponseType(typeof(void), StatusCodes.Status204NoContent)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> DeleteOrderAsync(long id) {
    await _ordersService.DeleteOrderAsync(id);
    return NoContent();
  }
}
