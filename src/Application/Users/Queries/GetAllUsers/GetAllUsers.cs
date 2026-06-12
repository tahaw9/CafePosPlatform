using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Users.Queries.GetAllUsers;

public record GetAllUsersQuery : IRequest<IEnumerable<AllUsersDto>?>
{
}

public class GetAllUsersQueryValidator : AbstractValidator<GetAllUsersQuery>
{
    public GetAllUsersQueryValidator()
    {
    }
}

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<AllUsersDto>?>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetAllUsersQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<IEnumerable<AllUsersDto>?> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _identityService.GetAllUsersAsync();
        return users;
    }
}
