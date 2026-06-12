using CafePosBackend.Application.Tables.Queries.GetTables;
using CafePosBackend.Application.Tables.Commands.UpdateTableStatus;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CafePosBackend.Web.Endpoints;

public class Tables : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetTables);
        groupBuilder.MapPatch(UpdateTableStatus, "{id}/status");
    }

    [EndpointSummary("Get all Tables")]
    [EndpointDescription("Retrieves the list and current status of all tables.")]
    public static async Task<Ok<IEnumerable<TableDto>>> GetTables(ISender sender)
    {
        var tables = await sender.Send(new GetTablesQuery());
        return TypedResults.Ok(tables);
    }

    [EndpointSummary("Update Table Status")]
    [EndpointDescription("Updates the status of a specific table by its ID.")]
    public static async Task<Ok<TableDto>> UpdateTableStatus(
        ISender sender, 
        Guid id, 
        UpdateTableStatusCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return TypedResults.Ok(result);
    }
}
