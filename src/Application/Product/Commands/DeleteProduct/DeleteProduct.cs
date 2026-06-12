using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Product.Commands.DeleteProduct;

public record DeleteProductCommand(Guid Id) : IRequest<bool>
{
}

public class DeleteProductCommandValidator : AbstractValidator<DeleteProductCommand>
{
    public DeleteProductCommandValidator()
    {
    }
}

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Products.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
        {
            throw new NullReferenceException("Product not found");
        }

        _context.Products.Remove(entity);
        int rowsAffected = await _context.SaveChangesAsync(cancellationToken);

        return rowsAffected > 0;
    }
}
