namespace CafePosBackend.Application.Common.Interfaces;

/// <summary>
/// Marker interface for MediatR requests that originate from a SignalR Hub.
/// Used by SignalRLoggingBehaviour to apply targeted logging
/// without polluting individual command handlers.
/// </summary>
public interface ISignalRRequest
{
}
