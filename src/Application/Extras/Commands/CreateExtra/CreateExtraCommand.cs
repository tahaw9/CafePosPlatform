using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Application.Extras.Queries.GetActiveExtras;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CafePosBackend.Application.Extras.Commands.CreateExtra;

[Authorize(Roles = Roles.Administrator)]
public record CreateExtraCommand : IRequest<ExtraDto>
{
    public string Name { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public bool IsAvailable { get; init; } = true;
    public int? DisplayOrder { get; init; }
}

public class CreateExtraCommandValidator : AbstractValidator<CreateExtraCommand>
{
    public CreateExtraCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Extra name is required.")
            .MaximumLength(100).WithMessage("Extra name must not exceed 100 characters.");

        RuleFor(v => v.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Extra price must be greater than or equal to zero.");

        RuleFor(v => v.DisplayOrder)
            .GreaterThanOrEqualTo(0).When(v => v.DisplayOrder.HasValue)
            .WithMessage("Display order must be greater than or equal to zero.");
    }
}

public class CreateExtraCommandHandler : IRequestHandler<CreateExtraCommand, ExtraDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMemoryCache _cache;

    public CreateExtraCommandHandler(IApplicationDbContext context, IMapper mapper, IMemoryCache cache)
    {
        _context = context;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<ExtraDto> Handle(CreateExtraCommand request, CancellationToken cancellationToken)
    {
        int displayOrder;
        if (request.DisplayOrder.HasValue && request.DisplayOrder.Value > 0)
        {
            displayOrder = request.DisplayOrder.Value;
        }
        else
        {
            var maxOrder = await _context.Extras
                .Where(e => !e.IsDeleted)
                .MaxAsync(e => (int?)e.DisplayOrder, cancellationToken) ?? 0;
            displayOrder = maxOrder + 1;
        }

        var entity = new Extra
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Price = request.Price,
            IsAvailable = request.IsAvailable,
            DisplayOrder = displayOrder,
            IsDeleted = false
        };

        _context.Extras.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        // Evict cached active extras
        _cache.Remove(GetActiveExtrasQueryHandler.ActiveExtrasCacheKey);

        return _mapper.Map<ExtraDto>(entity);
    }
}
