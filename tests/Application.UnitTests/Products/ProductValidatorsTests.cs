using CafePosBackend.Application.Product.Commands.CreateProduct;
using CafePosBackend.Application.Product.Commands.UpdateProduct;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Products;

public class ProductValidatorsTests
{
    [Test]
    public void CreateProductCommandValidator_WithValidVariants_ShouldPass()
    {
        var validator = new CreateProductCommandValidator();
        var command = new CreateProductCommand
        {
            Name = "اسپرسو",
            Price = 70000,
            CategoryId = Guid.NewGuid(),
            Variants = new List<CreateProductVariantDto>
            {
                new() { Name = "تجاری", Price = 70000, IsAvailable = true, DisplayOrder = 1 },
                new() { Name = "تک‌خاستگاه", Price = 95000, IsAvailable = true, DisplayOrder = 2 }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void CreateProductCommandValidator_WithEmptyVariantName_ShouldFail()
    {
        var validator = new CreateProductCommandValidator();
        var command = new CreateProductCommand
        {
            Name = "اسپرسو",
            Price = 70000,
            CategoryId = Guid.NewGuid(),
            Variants = new List<CreateProductVariantDto>
            {
                new() { Name = "", Price = 70000 }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.StartsWith("Variants[0].Name"));
    }

    [Test]
    [TestCase(0)]
    [TestCase(-1000)]
    public void CreateProductCommandValidator_WithNonPositiveVariantPrice_ShouldFail(decimal price)
    {
        var validator = new CreateProductCommandValidator();
        var command = new CreateProductCommand
        {
            Name = "اسپرسو",
            Price = 70000,
            CategoryId = Guid.NewGuid(),
            Variants = new List<CreateProductVariantDto>
            {
                new() { Name = "سینگل", Price = price }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.StartsWith("Variants[0].Price"));
    }

    [Test]
    public void UpdateProductCommandValidator_WithValidVariants_ShouldPass()
    {
        var validator = new UpdateProductCommandValidator();
        var command = new UpdateProductCommand
        {
            Id = Guid.NewGuid(),
            Name = "آمریکانو",
            Price = 85000,
            CategoryId = Guid.NewGuid(),
            Variants = new List<UpdateProductVariantDto>
            {
                new() { Id = Guid.NewGuid(), Name = "مدیوم", Price = 85000, IsAvailable = true, DisplayOrder = 1 },
                new() { Id = null, Name = "لارج", Price = 110000, IsAvailable = true, DisplayOrder = 2 }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void UpdateProductCommandValidator_WithEmptyVariantName_ShouldFail()
    {
        var validator = new UpdateProductCommandValidator();
        var command = new UpdateProductCommand
        {
            Id = Guid.NewGuid(),
            Name = "آمریکانو",
            Price = 85000,
            CategoryId = Guid.NewGuid(),
            Variants = new List<UpdateProductVariantDto>
            {
                new() { Name = "   ", Price = 85000 }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.StartsWith("Variants[0].Name"));
    }

    [Test]
    [TestCase(0)]
    [TestCase(-500)]
    public void UpdateProductCommandValidator_WithNonPositiveVariantPrice_ShouldFail(decimal price)
    {
        var validator = new UpdateProductCommandValidator();
        var command = new UpdateProductCommand
        {
            Id = Guid.NewGuid(),
            Name = "آمریکانو",
            Price = 85000,
            CategoryId = Guid.NewGuid(),
            Variants = new List<UpdateProductVariantDto>
            {
                new() { Name = "دوبل", Price = price }
            }
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.StartsWith("Variants[0].Price"));
    }
}
