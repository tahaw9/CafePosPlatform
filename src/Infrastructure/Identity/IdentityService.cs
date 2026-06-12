using AutoMapper;
using AutoMapper.QueryableExtensions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Models;
using CafePosBackend.Application.Users;
using CafePosBackend.Application.Users.Queries.GetAllUsers;
using CafePosBackend.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserClaimsPrincipalFactory<ApplicationUser> _userClaimsPrincipalFactory;
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IAuthorizationService _authorizationService;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
        ApplicationDbContext context,   
        IAuthorizationService authorizationService,
        IMapper mapper)
    {
        _userManager = userManager;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _context = context;
        _authorizationService = authorizationService;
        _mapper = mapper;
    }

    public async Task<string?> GetUserNameAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        return user?.UserName;
    }

    public async Task<(Result Result, Guid UserId)> CreateUserAsync(string phoneNumber, string password, string fullName)
    {
        var user = new ApplicationUser
        {
            PhoneNumber = phoneNumber,
            UserName = phoneNumber,
            FullName = fullName
        };

        var result = await _userManager.CreateAsync(user, password);

        return (result.ToApplicationResult(), user.Id);
    }

    public async Task<bool> IsInRoleAsync(Guid userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        return user != null && await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<bool> AuthorizeAsync(Guid userId, string policyName)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
        {
            return false;
        }

        var principal = await _userClaimsPrincipalFactory.CreateAsync(user);

        var result = await _authorizationService.AuthorizeAsync(principal, policyName);

        return result.Succeeded;
    }

    public async Task<Result> DeleteUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        return user != null ? await DeleteUserAsync(user) : Result.Success();
    }

    public async Task<Result> DeleteUserAsync(ApplicationUser user)
    {
        var result = await _userManager.DeleteAsync(user);

        return result.ToApplicationResult();
    }

    public Task<string> CustomLogin(string phoneNumber, string password)
    {
        throw new NotImplementedException();
    }

    public async Task<ApplicationUserDto?> GetUserByPhoneNumberAsync(string phoneNumber)
    {
        var result = await _userManager.Users
            .FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
        if (result == null)
        {
            return null;
        }

        ApplicationUserDto userDto = new ApplicationUserDto();
        userDto.Id = result.Id;
        userDto.UserName = result.UserName;
        return userDto;
    }

    public async Task<ApplicationUserDto?> GetUserByIdAsync(Guid userId)
    {
        var result1 = await _userManager.Users
            .ToListAsync();
        var result = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (result == null)
        {
            return null;
        }

        var roles = await _context.UserRoles
            .Where(ur => ur.UserId == result.Id)
            .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
            .ToListAsync();

        return new ApplicationUserDto
        {
            Id = result.Id,
            UserName = result.UserName,
            FullName = result.FullName,
            PhoneNumber = result.PhoneNumber,
            Roles = roles!
        };
    }

    public async Task<List<AllUsersDto>?> GetAllUsersAsync()
    {
        var usersWithRoles = await _userManager.Users
            .Select(user => new AllUsersDto
            {
                Id = user.Id,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                FullName = user.FullName,
                Roles = _context.UserRoles
                    .Where(ur => ur.UserId == user.Id)
                    .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                    .ToList()
            })
            .ToListAsync();

        return usersWithRoles;
    }
}
