using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CafePosBackend.Application.UnpaidOrders.Commands.FlagOrderAsUnpaid;

public record FlagOrderAsUnpaidCommand : IRequest<Guid>
{
    public Guid OrderId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
}

public class FlagOrderAsUnpaidCommandHandler : IRequestHandler<FlagOrderAsUnpaidCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public FlagOrderAsUnpaidCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(FlagOrderAsUnpaidCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FindAsync(new object[] { request.OrderId }, cancellationToken);

        if (order == null)
        {
            throw new Exception($"Order {request.OrderId} not found.");
        }

        order.IsPaid = false;

        var unpaidOrder = new UnpaidOrder
        {
            OrderId = request.OrderId,
            CustomerName = request.CustomerName,
            PhoneNumber = request.PhoneNumber,
            IsSettled = false
        };

        _context.UnpaidOrders.Add(unpaidOrder);
        await _context.SaveChangesAsync(cancellationToken);

        return unpaidOrder.Id;
    }
}
