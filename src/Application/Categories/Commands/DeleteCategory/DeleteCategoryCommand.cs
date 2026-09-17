using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Categories.Commands.DeleteCategory;

[Authorize(Roles = Roles.Administrator)]
public record DeleteCategoryCommand(Guid Id) : IRequest;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new NotFoundException(nameof(Category), request.Id.ToString());
        }

        // Active Session / Products Guard: Reject deletion if any product belongs to this category
        var hasProducts = await _context.Products
            .AnyAsync(p => p.CategoryId == request.Id, cancellationToken);

        if (hasProducts)
        {
            throw new ConflictException("دسته‌بندی دارای آیتم‌های فعال است و امکان حذف آن وجود ندارد.");
        }

        // Soft deletion
        entity.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
