using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;

namespace CafePosBackend.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand : IRequest<Guid>
{
    // Nullable Guid for TableId, if null, means 'takeaway'
    public Guid? TableId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Total { get; set; }

    // Discount details
    public DiscountType? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }

    public PaymentMethod? PaymentMethod { get; set; }
    public bool? IsPaid { get; set; }
    // Navigation property
    public IEnumerable<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
}

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must have at least one item.")
            .Must(items => items.All(item => item.Quantity > 0)).WithMessage("Each order item must have a quantity greater than zero.");
        RuleFor(x => x.Total)
            .GreaterThan(0).WithMessage("Total must be greater than zero.");
    }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateOrderCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // ۱. تبدیل به زمان ایران
        var iranTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");
        var nowInIran = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, iranTimeZone);

        // ۲. پیدا کردن نقطه شروع ۶ صبحِ روز کاری جاری به وقت ایران
        DateTime iranBusinessStart;
        if (nowInIran.Hour < 6)
        {
            iranBusinessStart = nowInIran.Date.AddDays(-1).AddHours(6); // ۶ صبح دیروز
        }
        else
        {
            iranBusinessStart = nowInIran.Date.AddHours(6); // ۶ صبح امروز
        }

        DateTime iranBusinessEnd = iranBusinessStart.AddDays(1); // ۶ صبح فردا

        // ۳. تبدیل این دو زمان ایران به UTC جهت کوئری زدن روی دیتابیس (چون CreatedAt به UTC ذخیره می‌شود)
        DateTimeOffset utcStart = TimeZoneInfo.ConvertTimeToUtc(iranBusinessStart, iranTimeZone);
        DateTimeOffset utcEnd = TimeZoneInfo.ConvertTimeToUtc(iranBusinessEnd, iranTimeZone);
        var orderItems = _mapper.Map<List<OrderItem>>(request.Items);
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {

            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var lastOrderCode = await _context.Orders
                        .Where(o => o.Created >= utcStart && o.Created < utcEnd).Select(o => (long?)o.OrderCode)
                        .MaxAsync(cancellationToken) ?? 0;

                var entity = new Order
                {
                    Created = DateTimeOffset.UtcNow,
                    TableId = request.TableId,
                    Status = request.Status,
                    Total = request.Total,
                    DiscountType = request.DiscountType,
                    DiscountValue = request.DiscountType != null ? request.DiscountValue : null,
                    OrderCode = lastOrderCode + 1,
                    PaymentMethod = request.PaymentMethod,
                    IsPaid = (bool)(request.IsPaid != null ? request.IsPaid : false),
                    Id = Guid.NewGuid(),
                    Items = orderItems,
                };

                await _context.Orders.AddAsync(entity);
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return entity.Id;
            }

            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        });

    }
}
