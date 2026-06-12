using System;
using System.Collections.Generic;
using System.Text;

namespace CafePosBackend.Application.Users;

public class UserLoginRequestDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
