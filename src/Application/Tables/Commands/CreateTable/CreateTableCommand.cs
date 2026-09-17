using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Application.Tables.Queries.GetTables;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;
using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Application.Tables.Commands.CreateTable;

[Authorize(Roles = Roles.Administrator)]
public record CreateTableCommand : IRequest<TableDto>
{
    public int TableNumber { get; init; }
    public string? Name { get; init; }
}

public class CreateTableCommandValidator : AbstractValidator<CreateTableCommand>
{
    public CreateTableCommandValidator()
    {
        RuleFor(x => x.TableNumber)
            .GreaterThan(0)
            .WithMessage("شماره میز باید بزرگتر از صفر باشد.");

        RuleFor(x => x.Name)
            .MaximumLength(100)
            .WithMessage("نام میز نمی‌تواند بیش از ۱۰۰ کاراکتر باشد.");
    }
}

public class CreateTableCommandHandler : IRequestHandler<CreateTableCommand, TableDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateTableCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TableDto> Handle(CreateTableCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Tables
            .AnyAsync(t => t.TableNumber == request.TableNumber, cancellationToken);

        if (exists)
        {
            throw new ConflictException($"میز شماره {request.TableNumber} قبلاً ثبت شده است.");
        }

        var tableName = string.IsNullOrWhiteSpace(request.Name)
            ? $"میز {request.TableNumber}"
            : request.Name.Trim();

        var entity = new Table
        {
            Id = Guid.NewGuid(),
            TableNumber = request.TableNumber,
            Name = tableName,
            Status = TableStatus.Empty,
            IsDeleted = false
        };

        _context.Tables.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TableDto>(entity);
    }
}
