using CafePosBackend.Application.Cafe.Commands.RequestWaiter;
using CafePosBackend.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CafePosBackend.Web.Hubs;

/// <summary>
/// The main SignalR Hub for real-time café operations.
/// This hub is intentionally THIN — it only dispatches to MediatR.
/// All business logic lives in Application-layer command/query handlers.
/// </summary>
//[Authorize]
public class CafeHub : Hub<ICafeHubClient>
{
    private readonly ISender _sender;
    private readonly ILogger<CafeHub> _logger;

    public CafeHub(ISender sender, ILogger<CafeHub> logger)
    {
        _sender = sender;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var connectionId = Context.ConnectionId;

        _logger.LogInformation(
            "Client connected. UserId: {UserId}, ConnectionId: {ConnectionId}",
            userId, connectionId);

        // Add all authenticated admin/barista users to an "AdminDashboard" group
        // so we can broadcast specifically to admin clients.
        await Groups.AddToGroupAsync(connectionId, "AdminDashboard");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        var connectionId = Context.ConnectionId;

        _logger.LogInformation(
            "Client disconnected. UserId: {UserId}, ConnectionId: {ConnectionId}, Error: {Error}",
            userId, connectionId, exception?.Message);

        await Groups.RemoveFromGroupAsync(connectionId, "AdminDashboard");

        await base.OnDisconnectedAsync(exception);
    }

    // ─── Client-to-Server methods (frontend calls connection.invoke) ───
    // These are thin dispatchers — zero business logic here.

    /// <summary>
    /// Frontend calls: connection.invoke("RequestWaiter", tableId)
    /// Dispatches to RequestWaiterCommandHandler via MediatR.
    /// </summary>
    public async Task RequestWaiter(string tableId)
    {
        await _sender.Send(new RequestWaiterCommand { TableId = tableId });
    }
}

