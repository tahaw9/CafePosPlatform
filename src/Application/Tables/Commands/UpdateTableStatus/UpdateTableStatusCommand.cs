using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using MediatR;
using FluentValidation;
using Ardalis.GuardClauses;
using AutoMapper;
using CafePosBackend.Application.Tables.Queries.GetTables;

namespace CafePosBackend.Application.Tables.Commands.UpdateTableStatus;

public record UpdateTableStatusCommand : IRequest<TableDto>
{
    public Guid Id { get; init; }
    public string Status { get; init; } = string.Empty;
}

public class UpdateTableStatusCommandValidator : AbstractValidator<UpdateTableStatusCommand>
{
    public UpdateTableStatusCommandValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .Must(status => status == "empty" || status == "occupied" || status == "waiter_called")
            .WithMessage("Status must be 'empty', 'occupied', or 'waiter_called'.");
    }
}

public class UpdateTableStatusCommandHandler : IRequestHandler<UpdateTableStatusCommand, TableDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateTableStatusCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TableDto> Handle(UpdateTableStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Tables
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Status = request.Status.ToLower() switch
        {
            "empty" => TableStatus.Empty,
            "occupied" => TableStatus.Occupied,
            "waiter_called" => TableStatus.WaiterCalled,
            _ => TableStatus.Empty
        };

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TableDto>(entity);
    }
}
