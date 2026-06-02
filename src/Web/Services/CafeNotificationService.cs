using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CafePosBackend.Web.Services;

/// <summary>
/// Implements ICafeNotificationService using SignalR.
/// Broadcasts real-time events to the "AdminDashboard" group.
/// </summary>
public class CafeNotificationService : ICafeNotificationService
{
    private readonly IHubContext<CafeHub, ICafeHubClient> _hubContext;

    public CafeNotificationService(IHubContext<CafeHub, ICafeHubClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyNewOrder(NewOrderNotification orderDetails)
    {
        await _hubContext.Clients.Group("AdminDashboard").ReceiveNewOrder(orderDetails);
    }

    public async Task NotifyWaiterCall(string tableId)
    {
        await _hubContext.Clients.Group("AdminDashboard").WaiterCalled(tableId);
    }
}
