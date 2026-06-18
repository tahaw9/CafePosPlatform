using CafePosBackend.Application.Common.Models;
using CafePosBackend.Application.Users;
using CafePosBackend.Application.Users.Queries.GetAllUsers;

namespace CafePosBackend.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<string?> GetUserNameAsync(Guid userId);

    Task<List<AllUsersDto>?> GetAllUsersAsync();
    Task<ApplicationUserDto?> GetUserByPhoneNumberAsync(string phoneNumber);
    Task<ApplicationUserDto?> GetUserByIdAsync(Guid userId);
    Task<string> CustomLogin(string phoneNumber, string password);

    Task<bool> IsInRoleAsync(Guid userId, string role);

    Task<bool> AuthorizeAsync(Guid userId, string policyName);

    Task<(Result Result, Guid UserId)> CreateUserAsync(string phoneNumber, string password, string name, string role);
    Task<Result> ToggleUserStatusAsync(Guid userId);
    Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);

    Task<Result> DeleteUserAsync(Guid userId);
}
