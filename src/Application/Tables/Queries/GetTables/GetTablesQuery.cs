using CafePosBackend.Application.Common.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace CafePosBackend.Application.Tables.Queries.GetTables;

public record GetTablesQuery : IRequest<IEnumerable<TableDto>>;

public class GetTablesQueryHandler : IRequestHandler<GetTablesQuery, IEnumerable<TableDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTablesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TableDto>> Handle(GetTablesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Tables
            .AsNoTracking()
            .ProjectTo<TableDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
