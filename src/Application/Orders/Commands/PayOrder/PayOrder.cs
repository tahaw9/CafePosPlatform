using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using System.Text.Json.Serialization;
using MediatR;
using FluentValidation;
using Ardalis.GuardClauses;

namespace CafePosBackend.Application.Orders.Commands.PayOrder;

public record PayOrderCommand : IRequest
{
    [JsonIgnore]
    public Guid Id { get; init; }

    public PaymentMethod PaymentMethod { get; init; }

    public DiscountType? DiscountType { get; init; }

    public decimal? DiscountValue { get; init; }
}

public class PayOrderCommandValidator : AbstractValidator<PayOrderCommand>
{
    public PayOrderCommandValidator()
    {
        RuleFor(x => x.PaymentMethod)
            .IsInEnum().WithMessage("A valid PaymentMethod is required.");

        When(x => x.DiscountType.HasValue, () =>
        {
            RuleFor(x => x.DiscountValue)
                .NotNull().WithMessage("Discount value is required when discount type is specified.")
                .GreaterThanOrEqualTo(0).WithMessage("Discount value must be zero or positive.");
        });
    }
}

public class PayOrderCommandHandler : IRequestHandler<PayOrderCommand>
{
    private readonly IApplicationDbContext _context;

    public PayOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(PayOrderCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.PaymentMethod = request.PaymentMethod;
        entity.DiscountType = request.DiscountType;
        entity.DiscountValue = request.DiscountValue;
        entity.IsPaid = true;
        entity.Status = OrderStatus.Completed;
        _context.Orders.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
