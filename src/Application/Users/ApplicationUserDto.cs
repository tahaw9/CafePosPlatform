using System;
using System.Collections.Generic;
using System.Text;

namespace CafePosBackend.Application.Users;

public class ApplicationUserDto
{
    public Guid Id { get; set; }
    public string? UserName { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public List<string>? Roles { get; set; }
}
