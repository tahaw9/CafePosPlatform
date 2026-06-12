using CafePosBackend.Application.Common.Generics.Queries.PaginationQuery;
using CafePosBackend.Application.Common.Models;
using CafePosBackend.Application.Product.Commands.CreateProduct;
using CafePosBackend.Application.TodoItems.Commands.CreateTodoItem;
using CafePosBackend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

using CafePosBackend.Application.Product;
using CafePosBackend.Application.Product.Queries.ProductPagination;
using CafePosBackend.Application.Product.Queries.GetProducts;
using CafePosBackend.Application.Product.Commands.UpdateProduct;
using CafePosBackend.Application.Product.Commands.DeleteProduct;
using CafePosBackend.Application.Product.Commands.ChangeProductAvailablity;

namespace CafePosBackend.Web.Endpoints;

public class Products : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetProducts, "");
        groupBuilder.MapPost(CreateProduct);
        groupBuilder.MapPost(GetProductPagination, "Pagination");
        groupBuilder.MapPut(UpdateProduct, "");
        groupBuilder.MapPut(ChangeAvailablity, "ChangeAvailability/{id}");
        groupBuilder.MapDelete(DeleteProduct, "{id}");
    }

    [EndpointSummary("Create a new Product")]
    [EndpointDescription("Creates a new product using the provided details and returns the ID of the created product.")]
    public static async Task<Created<Guid>> CreateProduct(ISender sender, CreateProductCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(Products)}/{id}", id);
    }

    [EndpointSummary("Update an existing Product")]
    [EndpointDescription("Updates an existing product using the provided details and returns the ID of the updated product.")]
    public static async Task<Ok<bool>> UpdateProduct(ISender sender, UpdateProductCommand command)
    {
        var isDone = await sender.Send(command);

        return TypedResults.Ok(isDone);
    }

    [EndpointSummary("Change the availability of an existing Product")]
    [EndpointDescription("Changes the availability status of an existing product using the provided details and returns a boolean indicating success.")]
    public static async Task<Ok<bool>> ChangeAvailablity(ISender sender, Guid id)
    {
        var isDone = await sender.Send(new ChangeProductAvailablityCommand(id));

        return TypedResults.Ok(isDone);
    }

    [EndpointSummary("Get all Products")]
    [EndpointDescription("Retrieves a list of all products, optionally filtered by category or availability.")]
    public static async Task<Ok<IEnumerable<ProductDto>>> GetProducts(
        ISender sender,
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? isAvailable)
    {
        var products = await sender.Send(new GetProductsQuery { CategoryId = categoryId, IsAvailable = isAvailable });
        return TypedResults.Ok(products);
    }

    [EndpointSummary("Delete an existing Product")]
    [EndpointDescription("Deletes an existing product using the provided ID and returns a boolean indicating success.")]
    public static async Task<Ok<bool>> DeleteProduct(ISender sender, Guid id)
    {
        var command = new DeleteProductCommand(id);
        var isDone = await sender.Send(command);

        return TypedResults.Ok(isDone);
    }


    [EndpointSummary("Products Pagination")]
    [EndpointDescription("Retrieves a paginated list of products.")]
    public static async Task<Ok<BaseResponsePagination<IEnumerable<ProductDto>>>> GetProductPagination(ISender sender, [FromBody] ProductPaginationQuery query)
    {
        var products = await sender.Send(query);
        return TypedResults.Ok(products);
    }
}
