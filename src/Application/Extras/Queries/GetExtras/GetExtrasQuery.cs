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

namespace CafePosBackend.Application.Extras.Queries.GetExtras;

public record GetExtrasQuery : IRequest<IEnumerable<ExtraDto>>
{
    public bool? IsAvailable { get; init; }
}

public class GetExtrasQueryHandler : IRequestHandler<GetExtrasQuery, IEnumerable<ExtraDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetExtrasQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ExtraDto>> Handle(GetExtrasQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Extras
            .AsNoTracking()
            .Where(e => !e.IsDeleted);

        if (request.IsAvailable.HasValue)
        {
            query = query.Where(e => e.IsAvailable == request.IsAvailable.Value);
        }

        return await query
            .OrderBy(e => e.DisplayOrder)
            .ThenBy(e => e.Name)
            .ProjectTo<ExtraDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
