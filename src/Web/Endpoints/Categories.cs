using CafePosBackend.Application.Categories;
using CafePosBackend.Application.Categories.Commands.CreateCategory;
using CafePosBackend.Application.Categories.Queries.GetAllCategories;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CafePosBackend.Web.Endpoints;

public class Categories : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(CreateCategory);

    }

    [EndpointSummary("Create a new Category")]
    [EndpointDescription("Creates a new Categoryusing the provided details and returns the ID of the created category.")]
    public static async Task<Created<Guid>> CreateCategory(ISender sender, CreateCategoryCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(Categories)}/{id}", id);
    }

    [EndpointSummary("Get All Categories")]
    [EndpointDescription("Get all available menu categories.")]
    public static async Task<Ok<IEnumerable<CategoryDto>>> GetAllCategories(ISender sender)
    {
        var categories = await sender.Send(new GetAllCategoriesQuery());
        return TypedResults.Ok(categories);
    }
}
