using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Application.Tables.Queries.GetTables;
using CafePosBackend.Domain.Constants;
using Ardalis.GuardClauses;
using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Application.Tables.Commands.UpdateTable;

[Authorize(Roles = Roles.Administrator)]
public record UpdateTableCommand : IRequest<TableDto>
{
    public Guid Id { get; init; }
    public int TableNumber { get; init; }
    public string? Name { get; init; }
}

public class UpdateTableCommandValidator : AbstractValidator<UpdateTableCommand>
{
    public UpdateTableCommandValidator()
    {
        RuleFor(x => x.TableNumber)
            .GreaterThan(0)
            .WithMessage("شماره میز باید بزرگتر از صفر باشد.");

        RuleFor(x => x.Name)
            .MaximumLength(100)
            .WithMessage("نام میز نمی‌تواند بیش از ۱۰۰ کاراکتر باشد.");
    }
}

public class UpdateTableCommandHandler : IRequestHandler<UpdateTableCommand, TableDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateTableCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TableDto> Handle(UpdateTableCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Tables
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (request.TableNumber != entity.TableNumber)
        {
            var conflict = await _context.Tables
                .AnyAsync(t => t.Id != request.Id && t.TableNumber == request.TableNumber, cancellationToken);

            if (conflict)
            {
                throw new ConflictException($"میز شماره {request.TableNumber} قبلاً برای میز دیگری ثبت شده است.");
            }
        }

        entity.TableNumber = request.TableNumber;
        entity.Name = string.IsNullOrWhiteSpace(request.Name)
            ? $"میز {request.TableNumber}"
            : request.Name.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TableDto>(entity);
    }
}
