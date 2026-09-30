using System;
using CafePosBackend.Application.Extras.Commands.CreateExtra;
using CafePosBackend.Application.Extras.Commands.UpdateExtra;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Extras;

public class ExtraValidatorsTests
{
    [Test]
    public void CreateExtraCommandValidator_WithValidInputs_ShouldPass()
    {
        var validator = new CreateExtraCommandValidator();
        var command = new CreateExtraCommand
        {
            Name = "سیروپ کارامل",
            Price = 15000,
            IsAvailable = true,
            DisplayOrder = 1
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeTrue();
    }

    [Test]
    [TestCase("")]
    [TestCase("   ")]
    [TestCase(null)]
    public void CreateExtraCommandValidator_WithInvalidName_ShouldFail(string? name)
    {
        var validator = new CreateExtraCommandValidator();
        var command = new CreateExtraCommand
        {
            Name = name!,
            Price = 15000
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateExtraCommand.Name));
    }

    [Test]
    public void CreateExtraCommandValidator_WithTooLongName_ShouldFail()
    {
        var validator = new CreateExtraCommandValidator();
        var command = new CreateExtraCommand
        {
            Name = new string('A', 101),
            Price = 15000
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateExtraCommand.Name));
    }

    [Test]
    public void CreateExtraCommandValidator_WithNegativePrice_ShouldFail()
    {
        var validator = new CreateExtraCommandValidator();
        var command = new CreateExtraCommand
        {
            Name = "سیروپ وانیل",
            Price = -5000
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateExtraCommand.Price));
    }

    [Test]
    public void CreateExtraCommandValidator_WithNegativeDisplayOrder_ShouldFail()
    {
        var validator = new CreateExtraCommandValidator();
        var command = new CreateExtraCommand
        {
            Name = "شات اضافه",
            Price = 10000,
            DisplayOrder = -1
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateExtraCommand.DisplayOrder));
    }

    [Test]
    public void UpdateExtraCommandValidator_WithValidInputs_ShouldPass()
    {
        var validator = new UpdateExtraCommandValidator();
        var command = new UpdateExtraCommand
        {
            Id = Guid.NewGuid(),
            Name = "سیروP فندق",
            Price = 18000,
            IsAvailable = true,
            DisplayOrder = 2
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void UpdateExtraCommandValidator_WithEmptyId_ShouldFail()
    {
        var validator = new UpdateExtraCommandValidator();
        var command = new UpdateExtraCommand
        {
            Id = Guid.Empty,
            Name = "سیروپ فندق",
            Price = 18000
        };

        var result = validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(UpdateExtraCommand.Id));
    }
}
