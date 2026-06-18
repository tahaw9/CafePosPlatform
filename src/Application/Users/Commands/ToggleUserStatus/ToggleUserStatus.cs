using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Users.Commands.ToggleUserStatus;

public record ToggleUserStatusCommand(Guid UserId) : IRequest;

public class ToggleUserStatusCommandHandler : IRequestHandler<ToggleUserStatusCommand>
{
    private readonly IIdentityService _identityService;

    public ToggleUserStatusCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.ToggleUserStatusAsync(request.UserId);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Failed to toggle user status.");
        }
    }
}
