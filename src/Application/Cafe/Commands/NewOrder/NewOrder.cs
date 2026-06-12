using System;
using System.Collections.Generic;
using System.Text;
using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Cafe.Commands.NewOrder;

public record NewOrderCommand : IRequest<bool>, ISignalRRequest
{
    public string TableId { get; init; } = string.Empty;
}

public class NewOrderCommandValidator : AbstractValidator<NewOrderCommand>
{
    public NewOrderCommandValidator()
    {
        RuleFor(x => x.TableId)
            .NotEmpty().WithMessage("TableId is required.");
    }
}

public class NewOrderCommandHandler : IRequestHandler<NewOrderCommand, bool>
{
    private readonly ICafeNotificationService _notifications;

    public NewOrderCommandHandler(ICafeNotificationService notifications)
    {
        _notifications = notifications;
    }

    public async Task<bool> Handle(NewOrderCommand request, CancellationToken cancellationToken)
    {
        // Here you could add business logic, e.g.:
        // - Log to database
        // - Check if the table exists
        // - Prevent spam (rate-limit waiter calls)

        // Broadcast to all connected admin dashboard clients
        await _notifications.NotifyNewOrder(new NewOrderNotification { TableId = request.TableId });

        return true;
    }
}


