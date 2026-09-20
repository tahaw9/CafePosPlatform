using CafePosBackend.Application.Common.Behaviours;
using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using MediatR;
using Moq;
using NUnit.Framework;

namespace CafePosBackend.Application.UnitTests.Common.Behaviours;

[Authorize]
public class SimpleAuthorizedRequest : IRequest<Unit> { }

[Authorize(Roles = "Administrator, Barista")]
public class MultiRoleAuthorizedRequest : IRequest<Unit> { }

public class UnrestrictedRequest : IRequest<Unit> { }

public class AuthorizationBehaviourTests
{
    private Mock<IUser> _user = null!;
    private Mock<IIdentityService> _identityService = null!;

    [SetUp]
    public void Setup()
    {
        _user = new Mock<IUser>();
        _identityService = new Mock<IIdentityService>();
    }

    [Test]
    public void ShouldThrowUnauthorizedAccessExceptionWhenUserNotAuthenticated()
    {
        _user.Setup(x => x.Id).Returns((Guid?)null);

        var behaviour = new AuthorizationBehaviour<SimpleAuthorizedRequest, Unit>(_user.Object, _identityService.Object);

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            behaviour.Handle(new SimpleAuthorizedRequest(), _ => Task.FromResult(Unit.Value), CancellationToken.None));
    }

    [Test]
    public async Task ShouldAuthorizeWhenRoleMatchesCaseInsensitivelyWithWhitespace()
    {
        _user.Setup(x => x.Id).Returns(Guid.NewGuid());
        _user.Setup(x => x.Roles).Returns(new List<string> { "barista" });

        var behaviour = new AuthorizationBehaviour<MultiRoleAuthorizedRequest, Unit>(_user.Object, _identityService.Object);

        var executed = false;
        await behaviour.Handle(new MultiRoleAuthorizedRequest(), _ =>
        {
            executed = true;
            return Task.FromResult(Unit.Value);
        }, CancellationToken.None);

        Assert.That(executed, Is.True);
    }

    [Test]
    public void ShouldThrowForbiddenAccessExceptionWhenRoleMismatch()
    {
        _user.Setup(x => x.Id).Returns(Guid.NewGuid());
        _user.Setup(x => x.Roles).Returns(new List<string> { "Customer" });

        var behaviour = new AuthorizationBehaviour<MultiRoleAuthorizedRequest, Unit>(_user.Object, _identityService.Object);

        Assert.ThrowsAsync<ForbiddenAccessException>(() =>
            behaviour.Handle(new MultiRoleAuthorizedRequest(), _ => Task.FromResult(Unit.Value), CancellationToken.None));
    }

    [Test]
    public async Task ShouldPassThroughWhenNoAuthorizeAttribute()
    {
        _user.Setup(x => x.Id).Returns((Guid?)null);

        var behaviour = new AuthorizationBehaviour<UnrestrictedRequest, Unit>(_user.Object, _identityService.Object);

        var executed = false;
        await behaviour.Handle(new UnrestrictedRequest(), _ =>
        {
            executed = true;
            return Task.FromResult(Unit.Value);
        }, CancellationToken.None);

        Assert.That(executed, Is.True);
    }
}
