namespace CafePosBackend.Application.Common.Interfaces;

/// <summary>
/// Strongly-typed SignalR client contract.
/// Defines methods the server can invoke on connected clients.
/// Method names here MUST match the frontend's connection.on("...") registrations.
/// </summary>
public interface ICafeHubClient
{
    /// <summary>
    /// Notifies admin clients that a new order has been placed.
    /// Frontend listens via: connection.on('ReceiveNewOrder', handler)
    /// </summary>
    Task ReceiveNewOrder(NewOrderNotification orderDetails);

    /// <summary>
    /// Notifies admin clients that a customer is calling a waiter.
    /// Frontend listens via: connection.on('WaiterCalled', handler)
    /// </summary>
    Task WaiterCalled(string tableId);
}

/// <summary>
/// Payload for the ReceiveNewOrder event.
/// Shape must match what the frontend expects in handleNewOrder(orderDetails).
/// </summary>
public class NewOrderNotification
{
    public string TableId { get; set; } = string.Empty;

    // Add more fields as needed:
    // public Guid OrderId { get; set; }
    // public decimal TotalAmount { get; set; }
    // public List<string> Items { get; set; } = [];
}
