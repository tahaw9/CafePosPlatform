using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CafePosBackend.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CafePosBackend.Application.Extras.Queries.GetActiveExtras;

public record GetActiveExtrasQuery : IRequest<IEnumerable<ExtraDto>>;

public class GetActiveExtrasQueryHandler : IRequestHandler<GetActiveExtrasQuery, IEnumerable<ExtraDto>>
{
    public const string ActiveExtrasCacheKey = "ActiveExtrasCatalog";
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMemoryCache _cache;

    public GetActiveExtrasQueryHandler(IApplicationDbContext context, IMapper mapper, IMemoryCache cache)
    {
        _context = context;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<IEnumerable<ExtraDto>> Handle(GetActiveExtrasQuery request, CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(ActiveExtrasCacheKey, out List<ExtraDto>? cachedExtras) && cachedExtras != null)
        {
            return cachedExtras;
        }

        var activeExtras = await _context.Extras
            .AsNoTracking()
            .Where(e => e.IsAvailable && !e.IsDeleted)
            .OrderBy(e => e.DisplayOrder)
            .ProjectTo<ExtraDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromHours(1))
            .SetSlidingExpiration(TimeSpan.FromMinutes(10));

        _cache.Set(ActiveExtrasCacheKey, activeExtras, cacheEntryOptions);

        return activeExtras;
    }
}
