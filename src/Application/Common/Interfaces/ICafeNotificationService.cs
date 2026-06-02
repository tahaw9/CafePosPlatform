namespace CafePosBackend.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the real-time notification mechanism.
/// Application layer depends on this; Web layer implements it via SignalR.
/// This keeps the Application layer free of any SignalR dependency.
/// </summary>
public interface ICafeNotificationService
{
    /// <summary>
    /// Broadcasts a new order notification to all connected admin dashboard clients.
    /// </summary>
    Task NotifyNewOrder(NewOrderNotification orderDetails);

    /// <summary>
    /// Broadcasts a waiter call notification to all connected admin dashboard clients.
    /// </summary>
    Task NotifyWaiterCall(string tableId);
}
