using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Cafe.Commands.RequestWaiter;

/// <summary>
/// Command sent when a customer (or the frontend) requests a waiter for a table.
/// Implements ISignalRRequest so the SignalRLoggingBehaviour handles logging automatically.
/// </summary>
public record RequestWaiterCommand : IRequest<bool>, ISignalRRequest
{
    public string TableId { get; init; } = string.Empty;
}

public class RequestWaiterCommandValidator : AbstractValidator<RequestWaiterCommand>
{
    public RequestWaiterCommandValidator()
    {
        RuleFor(x => x.TableId)
            .NotEmpty().WithMessage("TableId is required.");
    }
}

public class RequestWaiterCommandHandler : IRequestHandler<RequestWaiterCommand, bool>
{
    private readonly ICafeNotificationService _notifications;

    public RequestWaiterCommandHandler(ICafeNotificationService notifications)
    {
        _notifications = notifications;
    }

    public async Task<bool> Handle(RequestWaiterCommand request, CancellationToken cancellationToken)
    {
        // Here you could add business logic, e.g.:
        // - Log to database
        // - Check if the table exists
        // - Prevent spam (rate-limit waiter calls)

        // Broadcast to all connected admin dashboard clients
        await _notifications.NotifyWaiterCall(request.TableId);

        return true;
    }
}

