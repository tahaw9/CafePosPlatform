using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.Enums;
using Ardalis.GuardClauses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Application.Tables.Commands.DeleteTable;

[Authorize(Roles = Roles.Administrator)]
public record DeleteTableCommand(Guid Id) : IRequest<bool>;

public class DeleteTableCommandHandler : IRequestHandler<DeleteTableCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteTableCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteTableCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Tables
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        // 1. Active Session Lock: Check table status
        if (entity.Status != TableStatus.Empty)
        {
            throw new ConflictException("میز در حال حاضر خالی نیست و قابل حذف نمی‌باشد.");
        }

        // 2. Active Orders Lock: Check pending or preparing orders
        var hasActiveOrders = await _context.Orders
            .AnyAsync(o => o.TableId == request.Id && (o.Status == OrderStatus.Pending || o.Status == OrderStatus.Preparing), cancellationToken);

        if (hasActiveOrders)
        {
            throw new ConflictException("میز دارای سفارش فعال در حال آماده‌سازی یا ثبت است و قابل حذف نمی‌باشد.");
        }

        // 3. Historical Integrity: Soft delete
        entity.IsDeleted = true;
        entity.Status = TableStatus.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
