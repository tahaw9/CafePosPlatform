using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Enums;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace CafePosBackend.Application.Orders.Queries.GetOrders;

public record GetOrdersQuery : IRequest<IEnumerable<OrderDto>>
{
    public string? Status { get; init; }
}

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, IEnumerable<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetOrdersQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
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
        var utcStart = TimeZoneInfo.ConvertTimeToUtc(iranBusinessStart, iranTimeZone);
        var utcEnd = TimeZoneInfo.ConvertTimeToUtc(iranBusinessEnd, iranTimeZone);
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
            .Where(i => i.Created <= utcEnd && i.Created >= utcStart)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            {
                query = query.Where(o => o.Status == status);
            }
        }

        return await query
            .OrderByDescending(o => o.Created)
            .ProjectTo<OrderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
