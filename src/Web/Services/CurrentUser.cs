using System.Security.Claims;

using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Web.Services;

public class CurrentUser : IUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? Id
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            var userIdString = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub")
                ?? user.FindFirstValue("nameid");

            if (Guid.TryParse(userIdString, out var parsedId))
            {
                return parsedId;
            }

            return null;
        }
    }

    public List<string>? Roles => _httpContextAccessor.HttpContext?.User?.Claims
        .Where(c => c.Type == ClaimTypes.Role || 
                    c.Type.Equals("role", StringComparison.OrdinalIgnoreCase) || 
                    c.Type.Equals("roles", StringComparison.OrdinalIgnoreCase))
        .Select(x => x.Value)
        .Where(v => !string.IsNullOrWhiteSpace(v))
        .ToList();

}
