using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<CafePosBackend.Domain.Entities.Product> Products { get; }
    DbSet<Category> Categories { get; }


    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
