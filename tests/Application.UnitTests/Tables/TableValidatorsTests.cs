using CafePosBackend.Application.Tables.Commands.CreateTable;
using CafePosBackend.Application.Tables.Commands.UpdateTable;
using CafePosBackend.Application.Tables.Commands.UpdateTableStatus;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Application.UnitTests.Tables;

public class TableValidatorsTests
{
    [Test]
    public void CreateTableCommandValidator_WithValidData_ShouldPass()
    {
        var validator = new CreateTableCommandValidator();
        var command = new CreateTableCommand
        {
            TableNumber = 1,
            Name = "میز 1"
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    [TestCase(0)]
    [TestCase(-1)]
    [TestCase(-10)]
    public void CreateTableCommandValidator_WithZeroOrNegativeTableNumber_ShouldFail(int tableNumber)
    {
        var validator = new CreateTableCommandValidator();
        var command = new CreateTableCommand
        {
            TableNumber = tableNumber,
            Name = "میز آزمایشی"
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateTableCommand.TableNumber));
    }

    [Test]
    public void UpdateTableCommandValidator_WithZeroOrNegativeTableNumber_ShouldFail()
    {
        var validator = new UpdateTableCommandValidator();
        var command = new UpdateTableCommand
        {
            Id = Guid.NewGuid(),
            TableNumber = 0,
            Name = "میز"
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(UpdateTableCommand.TableNumber));
    }

    [Test]
    [TestCase("empty", true)]
    [TestCase("occupied", true)]
    [TestCase("waiter_called", true)]
    [TestCase("invalid_status", false)]
    [TestCase("", false)]
    public void UpdateTableStatusCommandValidator_ShouldValidateAllowedStatuses(string status, bool isValid)
    {
        var validator = new UpdateTableStatusCommandValidator();
        var command = new UpdateTableStatusCommand
        {
            Id = Guid.NewGuid(),
            Status = status
        };

        var result = validator.Validate(command);

        result.IsValid.ShouldBe(isValid);
    }
}
