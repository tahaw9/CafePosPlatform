using System;
using System.Collections.Generic;
using System.Text;

namespace CafePosBackend.Application.Users.Queries.GetAllUsers;

public class AllUsersDto
{
    public Guid Id { get; set; }
    public string? FullName { get; set; }
    public string PhoneNumber { get; set; } = default!;
    public bool IsActive { get; set; }
    public List<string?> Roles { get; set;} = default!; 
}
