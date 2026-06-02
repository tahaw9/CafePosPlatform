using CafePosBackend.Application.Common.Generics.Queries.PaginationQuery;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Models;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Application.Product.Queries.ProductPagination;

public record ProductPaginationQuery : PaginationQuery<ProductSearchFilterDto, ProductDto>
{
}

public class ProductPaginationQueryValidator : AbstractValidator<ProductPaginationQuery>
{
    public ProductPaginationQueryValidator()
    {
    }
}

public class ProductPaginationQueryHandler : IRequestHandler<ProductPaginationQuery, BaseResponsePagination<IEnumerable<ProductDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProductPaginationQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<BaseResponsePagination<IEnumerable<ProductDto>>> Handle(ProductPaginationQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products.AsNoTracking();

        if (request.Filters != null)
        {
            if (!string.IsNullOrWhiteSpace(request.Filters.Name))
            {
                query = query.Where(x => x.Name.ToLower().Contains(request.Filters.Name.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(request.Filters.ImageUrl))
            {
                query = query.Where(x => x.ImageUrl != null && x.ImageUrl.ToLower().Contains(request.Filters.ImageUrl.ToLower()));
            }

            if (request.Filters.IsAvailable.HasValue)
            {
                query = query.Where(x => x.IsAvailable == request.Filters.IsAvailable.Value);
            }

            if (request.Filters.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == request.Filters.CategoryId.Value);
            }
        }

        int totalCount = await query.CountAsync(cancellationToken);

        var data = await query
            .OrderByDescending(x => x.Created)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<ProductDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new BaseResponsePagination<IEnumerable<ProductDto>>
        {
            PageNumber = request.PageNumber,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
            Data = data
        };
    }
}
