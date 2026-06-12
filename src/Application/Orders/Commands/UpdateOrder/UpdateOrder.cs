using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using FluentValidation;
using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Application.Orders.Commands.UpdateOrder;

public record UpdateOrderCommand : IRequest<bool>
{
    public Guid Id { get; init; }
    public Guid? TableId { get; init; }
    public OrderStatus Status { get; init; }
    public decimal Total { get; init; }
    public DiscountType? DiscountType { get; init; }
    public decimal? DiscountValue { get; init; }
    public PaymentMethod? PaymentMethod { get; init; }
    public bool? IsPaid { get; init; }
    public IEnumerable<OrderItemDto> Items { get; init; } = new List<OrderItemDto>();
}

public class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
{
    public UpdateOrderCommandValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must have at least one item.")
            .Must(items => items.All(item => item.Quantity > 0)).WithMessage("Each order item must have a quantity greater than zero.");
        RuleFor(x => x.Total)
            .GreaterThan(0).WithMessage("Total must be greater than zero.");
    }
}

public class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateOrderCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return false;
        }

        // Update basic fields
        entity.TableId = request.TableId;
        entity.Status = request.Status;
        entity.Total = request.Total;
        entity.DiscountType = request.DiscountType;
        entity.DiscountValue = request.DiscountType != null ? request.DiscountValue : null;
        entity.PaymentMethod = request.PaymentMethod;
        entity.IsPaid = request.IsPaid ?? false;

        // Rebuild order items
        entity.Items.Clear();
        foreach (var itemDto in request.Items)
        {
            entity.Items.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                ProductName = itemDto.ProductName,
                UnitPrice = itemDto.UnitPrice,
                Quantity = itemDto.Quantity,
                Note = itemDto.Note
            });
        }
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
