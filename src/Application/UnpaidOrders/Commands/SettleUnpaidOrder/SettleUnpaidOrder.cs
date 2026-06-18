using CafePosBackend.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CafePosBackend.Application.UnpaidOrders.Commands.SettleUnpaidOrder;

public record SettleUnpaidOrderCommand(Guid Id) : IRequest;

public class SettleUnpaidOrderCommandHandler : IRequestHandler<SettleUnpaidOrderCommand>
{
    private readonly IApplicationDbContext _context;

    public SettleUnpaidOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SettleUnpaidOrderCommand request, CancellationToken cancellationToken)
    {
        var unpaidOrder = await _context.UnpaidOrders.FindAsync(new object[] { request.Id }, cancellationToken);

        if (unpaidOrder == null)
        {
            throw new Exception($"UnpaidOrder {request.Id} not found.");
        }

        unpaidOrder.IsSettled = true;
        unpaidOrder.SettledAt = DateTime.UtcNow;

        var order = await _context.Orders.FindAsync(new object[] { unpaidOrder.OrderId }, cancellationToken);
        if (order != null)
        {
            order.IsPaid = true;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
