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

namespace CafePosBackend.Web.Endpoints;

public class Products : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(CreateProduct);
        groupBuilder.MapPost(GetProductPagination, "Pagination");
        //groupBuilder.MapPut(UpdateTodoItem, "{id}");
        //groupBuilder.MapPatch(UpdateTodoItemDetail, "UpdateDetail/{id}");
        //groupBuilder.MapDelete(DeleteTodoItem, "{id}");
    }

    [EndpointSummary("Create a new Product")]
    [EndpointDescription("Creates a new product using the provided details and returns the ID of the created product.")]
    public static async Task<Created<Guid>> CreateProduct(ISender sender, CreateProductCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(Products)}/{id}", id);
    }


    [EndpointSummary("Products Pagination")]
    [EndpointDescription("Retrieves a paginated list of products.")]
    public static async Task<Ok<BaseResponsePagination<IEnumerable<ProductDto>>>> GetProductPagination(ISender sender, [FromBody] ProductPaginationQuery query)
    {
        var products = await sender.Send(query);
        return TypedResults.Ok(products);
    }
}
