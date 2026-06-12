using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Orders.Queries.GetOrders;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace CafePosBackend.Application.Orders.Queries.GetOrderById;

public record GetOrderByIdQuery : IRequest<OrderDto?>
{
    public Guid Id { get; init; }
}

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetOrderByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
            .AsNoTracking()
            .Where(o => o.Id == request.Id)
            .ProjectTo<OrderDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
