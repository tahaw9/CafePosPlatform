using CafePosBackend.Application.TodoItems.Commands.CreateTodoItem;
using CafePosBackend.Application.TodoItems.Commands.DeleteTodoItem;
using CafePosBackend.Application.TodoLists.Commands.CreateTodoList;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.FunctionalTests.TodoItems.Commands;

public class DeleteTodoItemTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTodoItemId()
    {
        var command = new DeleteTodoItemCommand(Guid.Empty);

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldDeleteTodoItem()
    {
        var listId = await TestApp.SendAsync(new CreateTodoListCommand
        {
            Title = "New List"
        });

        var itemId = await TestApp.SendAsync(new CreateTodoItemCommand
        {
            ListId = listId,
            Title = "New Item"
        });

        await TestApp.SendAsync(new DeleteTodoItemCommand(itemId));

        var item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldBeNull();
    }
}
