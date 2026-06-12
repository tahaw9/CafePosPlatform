using System.Runtime.CompilerServices;
using CafePosBackend.Application.Categories.Commands.CreateCategory;
using CafePosBackend.Application.Orders.Commands.CreateOrder;
using CafePosBackend.Application.Orders.Commands.PayOrder;
using CafePosBackend.Application.Orders.Commands.UpdateOrderStatus;
using CafePosBackend.Application.Orders.Commands.UpdateOrder;
using CafePosBackend.Application.Orders.Queries.GetOrders;
using CafePosBackend.Application.Orders.Queries.GetOrderById;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CafePosBackend.Web.Endpoints;

public class Orders : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetOrders);
        groupBuilder.MapGet(GetOrderById, "{id}");
        groupBuilder.MapPost(CreateOrder);
        groupBuilder.MapPut(UpdateOrder, "{id}");
        groupBuilder.MapPatch(PayOrder, "{id}/pay");
        groupBuilder.MapPut(UpdateOrderStatus, "{id}/status");
    }

    [EndpointSummary("Create a new Order")]
    [EndpointDescription("Creates a new Orderusing the provided details and returns the ID of the created order.")]
    public static async Task<Created<Guid>> CreateOrder(ISender sender, CreateOrderCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(Orders)}/{id}", id);
    }

    [EndpointSummary("Update an existing Order")]
    [EndpointDescription("Updates the details of an existing order.")]
    public static async Task<Results<NoContent, NotFound, BadRequest>> UpdateOrder(ISender sender, Guid id, UpdateOrderCommand command)
    {
        if (command.Id != Guid.Empty && id != command.Id)
        {
            return TypedResults.BadRequest();
        }

        var success = await sender.Send(command with { Id = id });

        return success ? TypedResults.NoContent() : TypedResults.NotFound();
    }

    [EndpointSummary("Pay an existing Order")]
    [EndpointDescription("Updates an existing order to be paid, applies discounts, sets payment method, and completes it.")]
    public static async Task<Results<NoContent, BadRequest>> PayOrder(ISender sender, Guid id, PayOrderCommand command)
    {
        if (command.Id != Guid.Empty && id != command.Id)
        {
            return TypedResults.BadRequest();
        }

        await sender.Send(command with { Id = id });

        return TypedResults.NoContent();
    }

    [EndpointSummary("Update Order Status")]
    [EndpointDescription("Updates the status of an existing order using the provided details and returns whether the update was successful.")]
    public static async Task<Ok<bool>> UpdateOrderStatus(ISender sender, Guid id, UpdateOrderStatusCommand command)
    {
        var isDone = await sender.Send(command with { Id = id });

        return TypedResults.Ok(isDone);
    }

    [EndpointSummary("Get all Orders")]
    [EndpointDescription("Retrieves a list of orders, optionally filtered by status.")]
    public static async Task<Ok<IEnumerable<OrderDto>>> GetOrders(ISender sender, [FromQuery] string? status)
    {
        var orders = await sender.Send(new GetOrdersQuery { Status = status });

        return TypedResults.Ok(orders);
    }

    [EndpointSummary("Get Order by ID")]
    [EndpointDescription("Retrieves the details of a single order by its ID.")]
    public static async Task<Results<Ok<OrderDto>, NotFound>> GetOrderById(ISender sender, Guid id)
    {
        var order = await sender.Send(new GetOrderByIdQuery { Id = id });
        return order != null ? TypedResults.Ok(order) : TypedResults.NotFound();
    }
}
