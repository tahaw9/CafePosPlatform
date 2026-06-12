using AutoMapper;
using CafePosBackend.Application.Users.Queries.GetAllUsers;
using Microsoft.AspNetCore.Identity;

namespace CafePosBackend.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string? FullName { get; set; }
}
