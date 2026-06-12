using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Product.Commands.ChangeProductAvailablity;

public record ChangeProductAvailablityCommand(Guid Id) : IRequest<bool>
{
}

public class ChangeProductAvailablityCommandValidator : AbstractValidator<ChangeProductAvailablityCommand>
{
    public ChangeProductAvailablityCommandValidator()
    {
    }
}

public class ChangeProductAvailablityCommandHandler : IRequestHandler<ChangeProductAvailablityCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ChangeProductAvailablityCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ChangeProductAvailablityCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Products.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
        {
            throw new NullReferenceException("Product not found");
        }

        entity.IsAvailable = !entity.IsAvailable;
        _context.Products.Update(entity);
        int rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }
}
