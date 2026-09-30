using System;
using System.Threading;
using System.Threading.Tasks;
using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Application.Extras.Queries.GetActiveExtras;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CafePosBackend.Application.Extras.Commands.DeleteExtra;

[Authorize(Roles = Roles.Administrator)]
public record DeleteExtraCommand(Guid Id) : IRequest<bool>;

public class DeleteExtraCommandHandler : IRequestHandler<DeleteExtraCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public DeleteExtraCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<bool> Handle(DeleteExtraCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Extras
            .FirstOrDefaultAsync(e => e.Id == request.Id && !e.IsDeleted, cancellationToken);

        if (entity == null)
        {
            throw new NotFoundException(nameof(Extra), request.Id.ToString());
        }

        entity.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);

        // Evict cached active extras
        _cache.Remove(GetActiveExtrasQueryHandler.ActiveExtrasCacheKey);

        return true;
    }
}
