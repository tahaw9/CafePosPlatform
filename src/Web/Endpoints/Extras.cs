using CafePosBackend.Application.Extras;
using CafePosBackend.Application.Extras.Commands.CreateExtra;
using CafePosBackend.Application.Extras.Commands.DeleteExtra;
using CafePosBackend.Application.Extras.Commands.ToggleExtraAvailability;
using CafePosBackend.Application.Extras.Commands.UpdateExtra;
using CafePosBackend.Application.Extras.Queries.GetActiveExtras;
using CafePosBackend.Application.Extras.Queries.GetExtras;
using CafePosBackend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CafePosBackend.Web.Endpoints;

public class Extras : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetExtras, "");
        groupBuilder.MapGet(GetActiveExtras, "Active");
        groupBuilder.MapPost(CreateExtra).RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapPut(UpdateExtra, "{id:guid}").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapPut(ToggleAvailability, "ChangeAvailability/{id:guid}").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapDelete(DeleteExtra, "{id:guid}").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
    }

    [EndpointSummary("Get all Extras")]
    [EndpointDescription("Retrieves all extras for management, optionally filtered by availability.")]
    public static async Task<Ok<IEnumerable<ExtraDto>>> GetExtras(ISender sender, [FromQuery] bool? isAvailable)
    {
        var extras = await sender.Send(new GetExtrasQuery { IsAvailable = isAvailable });
        return TypedResults.Ok(extras);
    }

    [EndpointSummary("Get Active Extras")]
    [EndpointDescription("Retrieves all active extras for cashier POS ordering with high-speed caching.")]
    public static async Task<Ok<IEnumerable<ExtraDto>>> GetActiveExtras(ISender sender)
    {
        var extras = await sender.Send(new GetActiveExtrasQuery());
        return TypedResults.Ok(extras);
    }

    [EndpointSummary("Create a new Extra")]
    [EndpointDescription("Creates a new Extra in the catalog. Restricted to Administrator.")]
    public static async Task<Results<Created<ExtraDto>, ProblemHttpResult>> CreateExtra(ISender sender, CreateExtraCommand command)
    {
        var extra = await sender.Send(command);
        return TypedResults.Created($"/api/Extras/{extra.Id}", extra);
    }

    [EndpointSummary("Update an existing Extra")]
    [EndpointDescription("Updates an existing extra's details. Restricted to Administrator.")]
    public static async Task<Results<Ok<ExtraDto>, ProblemHttpResult>> UpdateExtra(
        ISender sender,
        Guid id,
        UpdateExtraCommand command)
    {
        var extra = await sender.Send(command with { Id = id });
        return TypedResults.Ok(extra);
    }

    [EndpointSummary("Toggle Extra Availability")]
    [EndpointDescription("Toggles the availability status of an extra. Restricted to Administrator.")]
    public static async Task<Ok<bool>> ToggleAvailability(ISender sender, Guid id)
    {
        var isAvailable = await sender.Send(new ToggleExtraAvailabilityCommand(id));
        return TypedResults.Ok(isAvailable);
    }

    [EndpointSummary("Delete an Extra")]
    [EndpointDescription("Soft-deletes an extra from the catalog. Restricted to Administrator.")]
    public static async Task<Results<NoContent, ProblemHttpResult>> DeleteExtra(ISender sender, Guid id)
    {
        await sender.Send(new DeleteExtraCommand(id));
        return TypedResults.NoContent();
    }
}
