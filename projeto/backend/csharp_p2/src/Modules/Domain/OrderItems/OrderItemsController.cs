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

  [HttpPost("{orderId}")]
  [EndpointSummary("Upsert order items for a specific order ID")]
  [EndpointDescription("Creates or updates order items for a given order ID. If an item with the same product ID already exists, it will be updated; otherwise, a new item will be created.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<IActionResult> UpsertOrderItemsAsync(long orderId, [FromBody] List<UpsertOrderItemsDto> orderItems) {
    await orderItemsService.UpsertOrderItemAsync(orderId, orderItems);
    return Ok(new MessageDto("Order items upserted successfully."));
  }

  [HttpDelete("{orderItemId}")]
  [EndpointSummary("Delete an order item by ID")]
  [EndpointDescription("Deletes a specific order item based on its ID.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<IActionResult> DeleteOrderItemAsync(long orderItemId) {
    await orderItemsService.DeleteOrderItemAsync(orderItemId);
    return Ok(new MessageDto("Order item deleted successfully."));
  }
}
