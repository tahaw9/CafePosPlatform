using System.Reflection;
using CafePosBackend.Application.Common.Models;
using CafePosBackend.Application.TodoLists.Queries.GetTodos;
using CafePosBackend.Application.Users;
using CafePosBackend.Application.Users.Commands.CreateUser;
using CafePosBackend.Application.Users.Queries.GetAllUsers;
using CafePosBackend.Application.Users.Queries.GetCurrentUser;
using CafePosBackend.Application.Users.Queries.UserByPhoneNumber;
using CafePosBackend.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace CafePosBackend.Web.Endpoints;

public class Users : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapIdentityApi<ApplicationUser>();
        groupBuilder.MapPost(LoginWithPhone, "login-phone");
        groupBuilder.MapPost(CreateUser).RequireAuthorization(new AuthorizeAttribute { Roles = "Administrator" });
        groupBuilder.MapGet(GetAllUsers).RequireAuthorization(new AuthorizeAttribute { Roles = "Administrator" });
        groupBuilder.MapGet(GetCurrentUser, "me").RequireAuthorization();
        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    [EndpointSummary("login with phone for admins")]
    [EndpointDescription("Logs in the user with the provided phone number.")]
    public static async Task<Results<Ok<AccessTokenResponse>, EmptyHttpResult, ProblemHttpResult>> LoginWithPhone(
        ISender sender,
        SignInManager<ApplicationUser> signInManager,
        UserLoginRequestDto request)
    {
        if (request == null)
        {
            return TypedResults.Problem("اطلاعات ورودی نامعتبر است.", statusCode: StatusCodes.Status400BadRequest);
        }

        var userDto = await sender.Send(new UserByPhoneNumberQuery(request.PhoneNumber));
        if (userDto == null)
        {
            return TypedResults.Problem("شماره موبایل یا رمز عبور اشتباه است", statusCode: StatusCodes.Status400BadRequest);
        }

        signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;

        var signInResult = await signInManager.PasswordSignInAsync(
            userDto.UserName ?? request.PhoneNumber,
            request.Password,
            isPersistent: false,
            lockoutOnFailure: false);

        if (!signInResult.Succeeded)
        {
            return TypedResults.Problem("شماره موبایل یا رمز عبور اشتباه است", statusCode: StatusCodes.Status401Unauthorized);
        }

        return TypedResults.Empty;
    }


    [EndpointSummary("create user with for admins")]
    [EndpointDescription("Creates a new user with the provided phone number and password and full name.")]
    public static async Task<Results<Created<Guid>, EmptyHttpResult, ProblemHttpResult>> CreateUser(
        ISender sender,
        CreateUserCommand command)
    {
        var userId = await sender.Send(command);

        return TypedResults.Created($"/{nameof(ApplicationUser)}/{userId}", userId);
    }

    [EndpointSummary("get all users")]
    [EndpointDescription("Retrieves a list of all users.")]
    public static async Task<Results<Ok<IEnumerable<AllUsersDto>?>, ProblemHttpResult>> GetAllUsers(
        ISender sender)
    {
        var users = await sender.Send(new GetAllUsersQuery());
        if(users == null)
        {
            return TypedResults.Problem("خطا در دریافت کاربران", statusCode: StatusCodes.Status500InternalServerError);
        }

        return TypedResults.Ok<IEnumerable<AllUsersDto>?>(users);
    }

    [EndpointSummary("Log out")]
    [EndpointDescription("Logs out the current user by clearing the authentication cookie.")]
    public static async Task<Results<Ok, UnauthorizedHttpResult>> Logout(SignInManager<ApplicationUser> signInManager, [FromBody] object empty)
    {
        if (empty != null)
        {
            await signInManager.SignOutAsync();
            return TypedResults.Ok();
        }

        return TypedResults.Unauthorized();
    }

    [EndpointSummary("Get current user")]
    [EndpointDescription("Retrieves the profile of the currently logged-in user.")]
    public static async Task<Results<Ok<ApplicationUserDto>, NotFound, ProblemHttpResult>> GetCurrentUser(
        ISender sender)
    {
        var userDto = await sender.Send(new GetCurrentUserQuery());
        if (userDto == null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(userDto);
    }
}
