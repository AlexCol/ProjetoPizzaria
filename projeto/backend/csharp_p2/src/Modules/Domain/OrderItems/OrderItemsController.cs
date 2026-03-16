using csharp_p2.src.Shared.DTOs;

namespace csharp_p2.src.Modules.Domain;

[ApiController]
[Route("api/[controller]")]
public class OrderItemsController(
  IOrderItemsService orderItemsService
) : ControllerBase {
  [HttpGet("{orderId}")]
  [EndpointSummary("Get order items by order ID")]
  [EndpointDescription("Returns a list of order items associated with a specific order ID.")]
  [ProducesResponseType(typeof(List<OrderItem>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<List<OrderItem>>> GetItemsFromOrderIdAsync(long orderId) {
    var items = await orderItemsService.GetItensFromOrderId(orderId);
    if (items == null || items.Count == 0) {
      return NotFound(new ErrorResponseDto("No order items found for the specified order ID."));
    }
    return Ok(items);
  }
}
