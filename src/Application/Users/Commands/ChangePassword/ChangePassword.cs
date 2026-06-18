using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Users.Commands.ChangePassword;

public record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
    }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly IIdentityService _identityService;
    private readonly IUser _user;

    public ChangePasswordCommandHandler(IIdentityService identityService, IUser user)
    {
        _identityService = identityService;
        _user = user;
    }

    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (_user.Id == null)
        {
            throw new UnauthorizedAccessException();
        }

        var result = await _identityService.ChangePasswordAsync(_user.Id.Value, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(", ", result.Errors));
        }
    }
}
