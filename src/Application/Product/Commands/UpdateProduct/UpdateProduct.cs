using System;
using System.Collections.Generic;
using System.Linq;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Application.Product.Commands.UpdateProduct;

public record UpdateProductVariantDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

public record UpdateProductCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Base64Image { get; set; }
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public List<UpdateProductVariantDto>? Variants { get; set; }
}

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty).WithMessage("Product ID is required.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100).WithMessage("Product name is required and must be less than 100 characters.");
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Product price must be a non-negative value.");
        RuleFor(x => x.CategoryId).NotEqual(Guid.Empty).WithMessage("Category ID is required.");
        RuleForEach(x => x.Variants).ChildRules(v =>
        {
            v.RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            v.RuleFor(x => x.Price).GreaterThan(0);
        });
    }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public UpdateProductCommandHandler(IApplicationDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var getEntity = await _context.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (getEntity == null)
        {
            throw new NullReferenceException("Product not found");
        }

        if (!string.IsNullOrEmpty(request.Base64Image))
        {
            if (!string.IsNullOrEmpty(getEntity.ImageUrl))
            {
                _fileStorageService.DeleteImage(getEntity.ImageUrl);
            }
            getEntity.ImageUrl = await _fileStorageService.SaveBase64ImageAsync(request.Base64Image, "/images/products");
        }

        getEntity.Name = request.Name;
        getEntity.CategoryId = request.CategoryId;
        getEntity.IsAvailable = request.IsAvailable;
        getEntity.Price = request.Price;
        getEntity.Description = request.Description;

        if (request.Variants != null)
        {
            var existingVariantsById = getEntity.Variants
                .ToDictionary(v => v.Id);
            var incomingIds = new HashSet<Guid>();

            foreach (var variant in request.Variants)
            {
                if (variant.Id.HasValue && variant.Id.Value != Guid.Empty)
                {
                    incomingIds.Add(variant.Id.Value);
                }
            }

            // Remove variants that are not present in incoming list
            var toRemove = getEntity.Variants
                .Where(v => !incomingIds.Contains(v.Id))
                .ToList();

            foreach (var variant in toRemove)
            {
                getEntity.Variants.Remove(variant);
                _context.ProductVariants.Remove(variant);
            }

            // Update existing or add new
            foreach (var v in request.Variants)
            {
                if (v.Id.HasValue && v.Id.Value != Guid.Empty)
                {
                    if (existingVariantsById.TryGetValue(v.Id.Value, out var existingVariant))
                    {
                        existingVariant.Name = v.Name;
                        existingVariant.Price = v.Price;
                        existingVariant.IsAvailable = v.IsAvailable;
                        existingVariant.DisplayOrder = v.DisplayOrder;
                    }
                    else
                    {
                        getEntity.Variants.Add(new ProductVariant
                        {
                            Id = v.Id.Value,
                            ProductId = getEntity.Id,
                            Name = v.Name,
                            Price = v.Price,
                            IsAvailable = v.IsAvailable,
                            DisplayOrder = v.DisplayOrder
                        });
                    }
                }
                else
                {
                    getEntity.Variants.Add(new ProductVariant
                    {
                        ProductId = getEntity.Id,
                        Name = v.Name,
                        Price = v.Price,
                        IsAvailable = v.IsAvailable,
                        DisplayOrder = v.DisplayOrder
                    });
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
