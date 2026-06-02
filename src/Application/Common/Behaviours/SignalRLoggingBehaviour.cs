using CafePosBackend.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CafePosBackend.Application.Common.Behaviours;

/// <summary>
/// MediatR pipeline behaviour that applies structured logging
/// to any request marked with <see cref="ISignalRRequest"/>.
/// This keeps SignalR command handlers free of ILogger injection.
/// </summary>
public class SignalRLoggingBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ISignalRRequest
{
    private readonly ILogger<SignalRLoggingBehaviour<TRequest, TResponse>> _logger;

    public SignalRLoggingBehaviour(ILogger<SignalRLoggingBehaviour<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _logger.LogInformation("[SignalR] Processing hub command: {RequestName} {@Request}",
            requestName, request);

        var response = await next();

        _logger.LogInformation("[SignalR] Completed hub command: {RequestName}",
            requestName);

        return response;
    }
}
