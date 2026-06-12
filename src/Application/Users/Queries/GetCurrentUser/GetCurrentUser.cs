using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<ApplicationUserDto?>;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, ApplicationUserDto?>
{
    private readonly IIdentityService _identityService;
    private readonly IUser _currentUser;

    public GetCurrentUserQueryHandler(IIdentityService identityService, IUser currentUser)
    {
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task<ApplicationUserDto?> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.Id == null)
        {
            return null;
        }

        return await _identityService.GetUserByIdAsync(_currentUser.Id.Value);
    }
}
