using System;
using System.Collections.Generic;
using System.Linq;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using FluentValidation;
using MediatR;

namespace CafePosBackend.Application.Product.Commands.CreateProduct;

public record CreateProductVariantDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

public record CreateProductCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Base64Image { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public List<CreateProductVariantDto>? Variants { get; set; }
}

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CategoryId).NotEqual(Guid.Empty);
        RuleForEach(x => x.Variants).ChildRules(v =>
        {
            v.RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            v.RuleFor(x => x.Price).GreaterThan(0);
        });
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

        if (request.Variants != null && request.Variants.Count > 0)
        {
            foreach (var v in request.Variants)
            {
                entity.Variants.Add(new ProductVariant
                {
                    Id = Guid.NewGuid(),
                    ProductId = entity.Id,
                    Name = v.Name,
                    Price = v.Price,
                    IsAvailable = v.IsAvailable,
                    DisplayOrder = v.DisplayOrder
                });
            }
        }

        _context.Products.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
