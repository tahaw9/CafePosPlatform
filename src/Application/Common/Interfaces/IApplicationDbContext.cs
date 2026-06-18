using CafePosBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace CafePosBackend.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<CafePosBackend.Domain.Entities.Product> Products { get; }
    DbSet<Category> Categories { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<Table> Tables { get; }
    DbSet<UnpaidOrder> UnpaidOrders { get; }
    DatabaseFacade Database { get; }    

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
