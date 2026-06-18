using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CafePosBackend.Application.UnpaidOrders.Queries.GetUnpaidOrders;

public record UnpaidOrderDto
{
    public Guid Id { get; init; }
    public Guid OrderId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public bool IsSettled { get; init; }
    public DateTime? SettledAt { get; init; }
    public DateTime CreatedAt { get; init; }
    
    // Order details
    public decimal Total { get; init; }
    public long OrderCode { get; init; }
    public List<string> Items { get; init; } = new();
}

public record GetUnpaidOrdersQuery : IRequest<List<UnpaidOrderDto>>
{
    public string? PhoneNumber { get; init; }
    public string? CustomerName { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public bool? IsSettled { get; init; }
}

public class GetUnpaidOrdersQueryHandler : IRequestHandler<GetUnpaidOrdersQuery, List<UnpaidOrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUnpaidOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UnpaidOrderDto>> Handle(GetUnpaidOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.UnpaidOrders
            .Include(u => u.Order)
            .ThenInclude(o => o!.Items)
            .ThenInclude(i => i.Product)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            query = query.Where(u => u.PhoneNumber.Contains(request.PhoneNumber));
        }

        if (!string.IsNullOrEmpty(request.CustomerName))
        {
            query = query.Where(u => u.CustomerName.Contains(request.CustomerName));
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(u => u.Created >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(u => u.Created <= request.EndDate.Value);
        }

        if (request.IsSettled.HasValue)
        {
            query = query.Where(u => u.IsSettled == request.IsSettled.Value);
        }

        var unpaidOrders = await query.OrderByDescending(u => u.Created).ToListAsync(cancellationToken);

        return unpaidOrders.Select(u => new UnpaidOrderDto
        {
            Id = u.Id,
            OrderId = u.OrderId,
            CustomerName = u.CustomerName,
            PhoneNumber = u.PhoneNumber,
            IsSettled = u.IsSettled,
            SettledAt = u.SettledAt,
            CreatedAt = u.Created.DateTime,
            Total = u.Order?.Total ?? 0,
            OrderCode = u.Order?.OrderCode ?? 0,
            Items = u.Order?.Items?.Select(i => $"{i.Product?.Name} x{i.Quantity}").ToList() ?? new List<string>()
        }).ToList();
    }
}
