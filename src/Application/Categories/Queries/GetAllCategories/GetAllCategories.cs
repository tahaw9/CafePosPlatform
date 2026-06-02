using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Categories.Queries.GetAllCategories;

public record GetAllCategoriesQuery : IRequest<IEnumerable<CategoryDto>>
{
}

public class GetAllCategoriesQueryValidator : AbstractValidator<GetAllCategoriesQuery>
{
    public GetAllCategoriesQueryValidator()
    {
    }
}

public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
{
    private readonly IApplicationDbContext _context;

    private readonly IMapper _mapper;

    public GetAllCategoriesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.Categories
            .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        return categories;
    }
}
