using System.ComponentModel.DataAnnotations.Schema;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using Microsoft.Build.Tasks.Deployment.Bootstrapper;

namespace CafePosBackend.Application.Product.Commands.CreateProduct;

public record CreateProductCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Base64Image { get; set; } = string.Empty;
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
    private readonly IFileStorageService _fileStorageService;

    public CreateProductCommandHandler(IApplicationDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        string imageUrl = string.Empty;
        if (!string.IsNullOrEmpty(request.Base64Image))
        {
            imageUrl = await _fileStorageService.SaveBase64ImageAsync(request.Base64Image, "/images/products");
        }

        var entity = new CafePosBackend.Domain.Entities.Product
        {
            CategoryId = request.CategoryId,
            Created = DateTimeOffset.UtcNow,
            CreatedBy = Guid.Empty,
            Description = request.Description,
            Name = request.Name,
            Price = request.Price,
            ImageUrl = imageUrl,
            IsAvailable = request.IsAvailable,
            Id = Guid.NewGuid()
        };

        _context.Products.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
