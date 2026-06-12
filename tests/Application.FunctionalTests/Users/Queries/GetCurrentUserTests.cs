using CafePosBackend.Application.Users.Queries.GetCurrentUser;

namespace CafePosBackend.Application.FunctionalTests.Users.Queries;

public class GetCurrentUserTests : TestBase
{
    [Test]
    public async Task ShouldReturnNullWhenNotAuthenticated()
    {
        var query = new GetCurrentUserQuery();

        var result = await TestApp.SendAsync(query);

        result.ShouldBeNull();
    }

    [Test]
    public async Task ShouldReturnProfileWhenAuthenticated()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var query = new GetCurrentUserQuery();

        var result = await TestApp.SendAsync(query);

        result.ShouldNotBeNull();
        result!.Id.ShouldBe(userId);
        result.UserName.ShouldBe("test@local");
        result.PhoneNumber.ShouldBe("09123456789");
    }
}
