using CafePosBackend.Application.Product;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Products;

public class ProductDtoTests
{
    [Test]
    public void StartingPrice_WhenNoVariants_ShouldReturnBasePrice()
    {
        var dto = new ProductDto
        {
            Name = "چیزکیک",
            Price = 140000,
            Variants = new List<ProductVariantDto>()
        };

        dto.StartingPrice.ShouldBe(140000);
    }

    [Test]
    public void StartingPrice_WhenVariantsExistAndAllAvailable_ShouldReturnLowestVariantPrice()
    {
        var dto = new ProductDto
        {
            Name = "پیتزا مارگاریتا",
            Price = 200000,
            Variants = new List<ProductVariantDto>
            {
                new() { Name = "تک‌نفره", Price = 180000, IsAvailable = true },
                new() { Name = "دونفره", Price = 290000, IsAvailable = true }
            }
        };

        dto.StartingPrice.ShouldBe(180000);
    }

    [Test]
    public void StartingPrice_WhenSomeVariantsUnavailable_ShouldReturnLowestAvailableVariantPrice()
    {
        var dto = new ProductDto
        {
            Name = "اسپرسو",
            Price = 80000,
            Variants = new List<ProductVariantDto>
            {
                new() { Name = "دانه تجاری (ارزان ولی تمام شده)", Price = 65000, IsAvailable = false },
                new() { Name = "دانه ۱۰۰٪ عربیکا", Price = 90000, IsAvailable = true },
                new() { Name = "دانه گیشا کلمبیا", Price = 160000, IsAvailable = true }
            }
        };

        dto.StartingPrice.ShouldBe(90000);
    }

    [Test]
    public void StartingPrice_WhenAllVariantsUnavailable_ShouldFallbackToLowestVariantPrice()
    {
        var dto = new ProductDto
        {
            Name = "قهوه دمی",
            Price = 100000,
            Variants = new List<ProductVariantDto>
            {
                new() { Name = "V60 کلمبیا", Price = 120000, IsAvailable = false },
                new() { Name = "کمکس کنیا", Price = 140000, IsAvailable = false }
            }
        };

        dto.StartingPrice.ShouldBe(120000);
    }
}
