using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Users.Queries.UserByPhoneNumber;

public record UserByPhoneNumberQuery(string PhoneNumber) : IRequest<ApplicationUserDto?>;

public class UserIdByPhoneNumberQueryValidator : AbstractValidator<UserByPhoneNumberQuery>
{
    public UserIdByPhoneNumberQueryValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .WithMessage("شماره موبایل الزامی است.")
            .Matches(@"^09\d{9}$")
            .WithMessage("Invalid phone number format.");
    }
}

public class UserIdByPhoneNumberQueryHandler : IRequestHandler<UserByPhoneNumberQuery, ApplicationUserDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;


    public UserIdByPhoneNumberQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<ApplicationUserDto?> Handle(UserByPhoneNumberQuery request, CancellationToken cancellationToken)
    {
        var userDto = await _identityService.GetUserByPhoneNumberAsync(request.PhoneNumber);
        return userDto;
    }
}
