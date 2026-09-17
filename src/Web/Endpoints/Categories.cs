using CafePosBackend.Application.Categories;
using CafePosBackend.Application.Categories.Commands.CreateCategory;
using CafePosBackend.Application.Categories.Commands.DeleteCategory;
using CafePosBackend.Application.Categories.Commands.UpdateCategory;
using CafePosBackend.Application.Categories.Queries.GetAllCategories;
using CafePosBackend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CafePosBackend.Web.Endpoints;

public class Categories : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetAllCategories);
        groupBuilder.MapPost(CreateCategory).RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapPut(UpdateCategory, "{id:guid}").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
        groupBuilder.MapDelete(DeleteCategory, "{id:guid}").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Administrator });
    }

    [EndpointSummary("Get All Categories")]
    [EndpointDescription("Get all available menu and inventory categories sorted by display order.")]
    public static async Task<Ok<IEnumerable<CategoryDto>>> GetAllCategories(ISender sender)
    {
        var categories = await sender.Send(new GetAllCategoriesQuery());
        return TypedResults.Ok(categories);
    }

    [EndpointSummary("Create a new Category")]
    [EndpointDescription("Creates a new Category with specified name, icon, and display order. Restricted to Administrator.")]
    public static async Task<Results<Created<CategoryDto>, ProblemHttpResult>> CreateCategory(ISender sender, CreateCategoryCommand command)
    {
        var category = await sender.Send(command);
        return TypedResults.Created($"/api/Categories/{category.Id}", category);
    }

    [EndpointSummary("Update Category")]
    [EndpointDescription("Updates a category's name, icon, and display order. Restricted to Administrator.")]
    public static async Task<Results<Ok<CategoryDto>, ProblemHttpResult>> UpdateCategory(
        ISender sender,
        Guid id,
        UpdateCategoryCommand command)
    {
        var category = await sender.Send(command with { Id = id });
        return TypedResults.Ok(category);
    }

    [EndpointSummary("Delete Category")]
    [EndpointDescription("Soft-deletes a category if it has no associated products. Restricted to Administrator.")]
    public static async Task<Results<NoContent, ProblemHttpResult>> DeleteCategory(
        ISender sender,
        Guid id)
    {
        await sender.Send(new DeleteCategoryCommand(id));
        return TypedResults.NoContent();
    }
}
