using CafePosBackend.Application.UnpaidOrders.Commands.FlagOrderAsUnpaid;
using CafePosBackend.Application.UnpaidOrders.Commands.SettleUnpaidOrder;
using CafePosBackend.Application.UnpaidOrders.Queries.GetUnpaidOrders;
using CafePosBackend.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafePosBackend.Web.Endpoints;

public class UnpaidOrders : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(FlagAsUnpaid, "flag");
        groupBuilder.MapGet(GetUnpaidOrders);
        groupBuilder.MapPut(SettleUnpaidOrder, "{id}/settle");
    }

    public static async Task<Created<Guid>> FlagAsUnpaid(ISender sender, [FromBody] FlagOrderAsUnpaidCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/UnpaidOrders/{id}", id);
    }

    public static async Task<Ok<List<UnpaidOrderDto>>> GetUnpaidOrders(
        ISender sender, 
        [FromQuery] string? phoneNumber, 
        [FromQuery] string? customerName, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate, 
        [FromQuery] bool? isSettled)
    {
        var query = new GetUnpaidOrdersQuery
        {
            PhoneNumber = phoneNumber,
            CustomerName = customerName,
            StartDate = startDate,
            EndDate = endDate,
            IsSettled = isSettled
        };
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public static async Task<NoContent> SettleUnpaidOrder(ISender sender, Guid id)
    {
        await sender.Send(new SettleUnpaidOrderCommand(id));
        return TypedResults.NoContent();
    }
}
