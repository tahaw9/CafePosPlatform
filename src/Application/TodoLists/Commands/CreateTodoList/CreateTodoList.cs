using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.ValueObjects;

namespace CafePosBackend.Application.TodoLists.Commands.CreateTodoList;

public record CreateTodoListCommand : IRequest<Guid>
{
    public string? Title { get; init; }

    public string? Colour { get; init; }
}

public class CreateTodoListCommandHandler : IRequestHandler<CreateTodoListCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateTodoListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTodoListCommand request, CancellationToken cancellationToken)
    {
        var entity = new TodoList
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Colour = Colour.From(request.Colour ?? Colour.Grey)
        };

        _context.TodoLists.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
