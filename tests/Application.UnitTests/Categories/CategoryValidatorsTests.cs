using CafePosBackend.Application.Categories.Commands.CreateCategory;
using CafePosBackend.Application.Categories.Commands.UpdateCategory;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Categories;

public class CategoryValidatorsTests
{
    [Test]
    public void CreateCategoryCommandValidator_WithValidData_ShouldPass()
    {
        var validator = new CreateCategoryCommandValidator();
        var command = new CreateCategoryCommand
        {
            Name = "نوشیدنی گرم",
            Icon = "Coffee",
            DisplayOrder = 1
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    [TestCase("")]
    [TestCase("   ")]
    public void CreateCategoryCommandValidator_WithEmptyName_ShouldFail(string name)
    {
        var validator = new CreateCategoryCommandValidator();
        var command = new CreateCategoryCommand
        {
            Name = name,
            DisplayOrder = 1
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateCategoryCommand.Name));
    }

    [Test]
    public void CreateCategoryCommandValidator_WithLongName_ShouldFail()
    {
        var validator = new CreateCategoryCommandValidator();
        var command = new CreateCategoryCommand
        {
            Name = new string('A', 101),
            DisplayOrder = 1
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateCategoryCommand.Name));
    }

    [Test]
    [TestCase(-1)]
    [TestCase(-5)]
    public void CreateCategoryCommandValidator_WithNegativeDisplayOrder_ShouldFail(int displayOrder)
    {
        var validator = new CreateCategoryCommandValidator();
        var command = new CreateCategoryCommand
        {
            Name = "کیک",
            DisplayOrder = displayOrder
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateCategoryCommand.DisplayOrder));
    }

    [Test]
    public void UpdateCategoryCommandValidator_WithValidData_ShouldPass()
    {
        var validator = new UpdateCategoryCommandValidator();
        var command = new UpdateCategoryCommand
        {
            Id = Guid.NewGuid(),
            Name = "دسرها",
            Icon = "Cake",
            DisplayOrder = 2
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void UpdateCategoryCommandValidator_WithEmptyId_ShouldFail()
    {
        var validator = new UpdateCategoryCommandValidator();
        var command = new UpdateCategoryCommand
        {
            Id = Guid.Empty,
            Name = "دسرها",
            DisplayOrder = 2
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(UpdateCategoryCommand.Id));
    }

    [Test]
    [TestCase(-1)]
    [TestCase(-10)]
    public void UpdateCategoryCommandValidator_WithNegativeDisplayOrder_ShouldFail(int displayOrder)
    {
        var validator = new UpdateCategoryCommandValidator();
        var command = new UpdateCategoryCommand
        {
            Id = Guid.NewGuid(),
            Name = "دسرها",
            DisplayOrder = displayOrder
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(UpdateCategoryCommand.DisplayOrder));
    }
}
