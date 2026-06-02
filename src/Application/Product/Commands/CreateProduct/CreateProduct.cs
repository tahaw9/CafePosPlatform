using System.ComponentModel.DataAnnotations.Schema;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using Microsoft.Build.Tasks.Deployment.Bootstrapper;

namespace CafePosBackend.Application.Product.Commands.CreateProduct;

public record CreateProductCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
}

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
    }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var entity = new CafePosBackend.Domain.Entities.Product
        {
            CategoryId = request.CategoryId,
            Created = DateTimeOffset.UtcNow,
            CreatedBy = Guid.Empty,
            Description = request.Description,
            Name = request.Name,
            Price = request.Price,
            ImageUrl = request.ImageUrl,
            IsAvailable = request.IsAvailable,
            Id = Guid.NewGuid()
        };

        _context.Products.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
