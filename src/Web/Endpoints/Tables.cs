using CafePosBackend.Application.Tables.Commands.CreateTable;
using CafePosBackend.Application.Tables.Commands.DeleteTable;
using CafePosBackend.Application.Tables.Commands.UpdateTable;
using CafePosBackend.Application.Tables.Commands.UpdateTableStatus;
using CafePosBackend.Application.Tables.Queries.GetTables;
using CafePosBackend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CafePosBackend.Web.Endpoints;

public class Tables : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetTables);
        groupBuilder.MapPost(CreateTable).RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapPut(UpdateTable, "{id:guid}").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapDelete(DeleteTable, "{id:guid}").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapPatch(UpdateTableStatus, "{id:guid}/status").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.Administrator},{Roles.Barista}" });
    }

    [EndpointSummary("Get all Tables")]
    [EndpointDescription("Retrieves the list and current status of all tables.")]
    public static async Task<Ok<IEnumerable<TableDto>>> GetTables(ISender sender)
    {
        var tables = await sender.Send(new GetTablesQuery());
        return TypedResults.Ok(tables);
    }

    [EndpointSummary("Create Table")]
    [EndpointDescription("Creates a new table with an auto-generated or custom name. Restricted to Administrator.")]
    public static async Task<Results<Created<TableDto>, ProblemHttpResult>> CreateTable(
        ISender sender,
        CreateTableCommand command)
    {
        var table = await sender.Send(command);
        return TypedResults.Created($"/api/Tables/{table.Id}", table);
    }

    [EndpointSummary("Update Table")]
    [EndpointDescription("Updates a table's number and name. Restricted to Administrator.")]
    public static async Task<Results<Ok<TableDto>, ProblemHttpResult>> UpdateTable(
        ISender sender,
        Guid id,
        UpdateTableCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return TypedResults.Ok(result);
    }

    [EndpointSummary("Delete Table")]
    [EndpointDescription("Soft-deletes an empty table with no active orders. Restricted to Administrator.")]
    public static async Task<Results<NoContent, ProblemHttpResult>> DeleteTable(
        ISender sender,
        Guid id)
    {
        await sender.Send(new DeleteTableCommand(id));
        return TypedResults.NoContent();
    }

    [EndpointSummary("Update Table Status")]
    [EndpointDescription("Updates the status of a specific table by its ID. Allowed for Administrator and Barista.")]
    public static async Task<Ok<TableDto>> UpdateTableStatus(
        ISender sender, 
        Guid id, 
        UpdateTableStatusCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return TypedResults.Ok(result);
    }
}
