using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Users.Commands.CreateUser;

public record CreateUserCommand(string PhoneNumber, string Password, string FullName) : IRequest<Guid>;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .WithMessage("شماره موبایل الزامی است.")
            .Matches(@"^09\d{9}$")
            .WithMessage("فرمت شماره موبایل نامعتبر است.");
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6)
            .WithMessage("رمز عبور باید حداقل 6 کاراکتر باشد.");
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(100)
            .WithMessage("نام و نام خانوادگی نباید از 100 کاراکتر بیشتر باشد.");
    }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public CreateUserCommandHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var (result, userId) = await _identityService.CreateUserAsync(request.PhoneNumber, request.Password, request.FullName);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Failed to create user.");
        }

        return userId;
    }
}
