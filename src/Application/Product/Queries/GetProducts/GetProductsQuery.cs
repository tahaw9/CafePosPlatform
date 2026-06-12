using CafePosBackend.Application.Common.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace CafePosBackend.Application.Product.Queries.GetProducts;

public record GetProductsQuery : IRequest<IEnumerable<ProductDto>>
{
    public Guid? CategoryId { get; init; }
    public bool? IsAvailable { get; init; }
}

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetProductsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products.AsNoTracking();

        if (request.CategoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == request.CategoryId.Value);
        }

        if (request.IsAvailable.HasValue)
        {
            query = query.Where(x => x.IsAvailable == request.IsAvailable.Value);
        }

        return await query
            .OrderByDescending(x => x.Created)
            .ProjectTo<ProductDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
