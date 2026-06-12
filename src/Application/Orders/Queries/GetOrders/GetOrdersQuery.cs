using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Enums;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace CafePosBackend.Application.Orders.Queries.GetOrders;

public record GetOrdersQuery : IRequest<IEnumerable<OrderDto>>
{
    public string? Status { get; init; }
}

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, IEnumerable<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetOrdersQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            {
                query = query.Where(o => o.Status == status);
            }
        }

        return await query
            .OrderByDescending(o => o.Created)
            .ProjectTo<OrderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
