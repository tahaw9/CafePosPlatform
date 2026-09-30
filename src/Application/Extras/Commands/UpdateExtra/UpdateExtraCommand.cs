using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Application.Extras.Queries.GetActiveExtras;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CafePosBackend.Application.Extras.Commands.UpdateExtra;

[Authorize(Roles = Roles.Administrator)]
public record UpdateExtraCommand : IRequest<ExtraDto>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public bool IsAvailable { get; init; }
    public int DisplayOrder { get; init; }
}

public class UpdateExtraCommandValidator : AbstractValidator<UpdateExtraCommand>
{
    public UpdateExtraCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Extra ID is required.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Extra name is required.")
            .MaximumLength(100).WithMessage("Extra name must not exceed 100 characters.");

        RuleFor(v => v.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Extra price must be greater than or equal to zero.");

        RuleFor(v => v.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order must be greater than or equal to zero.");
    }
}

public class UpdateExtraCommandHandler : IRequestHandler<UpdateExtraCommand, ExtraDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMemoryCache _cache;

    public UpdateExtraCommandHandler(IApplicationDbContext context, IMapper mapper, IMemoryCache cache)
    {
        _context = context;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<ExtraDto> Handle(UpdateExtraCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Extras
            .FirstOrDefaultAsync(e => e.Id == request.Id && !e.IsDeleted, cancellationToken);

        if (entity == null)
        {
            throw new NotFoundException(nameof(Extra), request.Id.ToString());
        }

        entity.Name = request.Name.Trim();
        entity.Price = request.Price;
        entity.IsAvailable = request.IsAvailable;
        entity.DisplayOrder = request.DisplayOrder;

        await _context.SaveChangesAsync(cancellationToken);

        // Evict cached active extras
        _cache.Remove(GetActiveExtrasQueryHandler.ActiveExtrasCacheKey);

        return _mapper.Map<ExtraDto>(entity);
    }
}
